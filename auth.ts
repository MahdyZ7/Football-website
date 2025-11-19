import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import PostgresAdapter  from "@auth/pg-adapter"
import pool from "./lib/utils/db"
import { randomUUID } from "crypto"

// Custom 42 School OAuth Provider
const FortyTwoProvider = {
  id: "42-school",
  name: "42 School",
  type: "oauth" as const,
  authorization: {
    url: "https://api.intra.42.fr/oauth/authorize",
    params: { scope: "public" }
  },
  token: "https://api.intra.42.fr/oauth/token",
  userinfo: "https://api.intra.42.fr/v2/me",
  profile(profile: any) {
    return {
      id: String(profile.id),
      name: profile.usual_full_name || profile.displayname,
      email: profile.email,
      image: profile.image?.link || profile.image_url,
      // Store the intra login for later use
      intraLogin: profile.login
    }
  },
  clientId: process.env.FT_CLIENT_ID,
  clientSecret: process.env.FT_CLIENT_SECRET,
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: {
    ...PostgresAdapter(pool),
    // Override to ensure UUID generation for new users
    createUser: async (user) => {
      const adapter = PostgresAdapter(pool);
      const userWithId = { ...user, id: randomUUID() };
      return adapter.createUser!(userWithId as any) as any;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    FortyTwoProvider as any,
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Check if user is admin by querying the user_roles table or users.role
        const result = await pool.query(
          'SELECT role FROM users WHERE id = $1',
          [user.id]
        );
        session.user.role = result.rows[0]?.role || 'user';
        session.user.isAdmin = result.rows[0]?.role === 'admin';
      }
      return session;
    },
    async signIn() {
      try {
        // Always allow sign in - the adapter will handle user creation
        // Email consolidation will be handled by the adapter automatically
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
})

// Extend the session type to include our custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      isAdmin: boolean;
    }
  }

  interface User {
    role?: string;
    intraLogin?: string;
  }
}
