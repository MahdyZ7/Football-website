import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import PostgresAdapter from '@auth/pg-adapter'
import { Pool } from 'pg'
import { getUserRole } from '../../../utils/roles'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
})

// Custom 42 School provider
const FortyTwoProvider = {
  id: '42-school',
  name: '42 School',
  type: 'oauth',
  authorization: {
    url: 'https://api.intra.42.fr/oauth/authorize',
    params: {
      scope: 'public',
      response_type: 'code'
    }
  },
  token: 'https://api.intra.42.fr/oauth/token',
  userinfo: 'https://api.intra.42.fr/v2/me',
  clientId: process.env.FORTY_TWO_CLIENT_ID,
  clientSecret: process.env.FORTY_TWO_CLIENT_SECRET,
  profile(profile: Record<string, unknown>) {
    const profileData = profile as {
      id: number;
      displayname?: string;
      usual_full_name?: string;
      email: string;
      image?: {
        versions?: { large?: string };
        link?: string;
      };
    };
    
    return {
      id: profileData.id.toString(),
      name: profileData.displayname || profileData.usual_full_name,
      email: profileData.email,
      image: profileData.image?.versions?.large || profileData.image?.link
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PostgresAdapter(pool),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    FortyTwoProvider as any, // Custom provider type assertion
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Enable account linking - if a user signs in with a different provider
      // but same email, their accounts will be automatically linked
      if (account && user?.email) {
        try {
          // The PostgresAdapter will handle account linking automatically
          // when it finds existing users with the same email address
          return true
        } catch (error) {
          console.error('Sign in error:', error)
          return false
        }
      }
      return true
    },
    async session({ session, user }) {
      if (session.user?.email) {
        const role = await getUserRole(session.user.email)
        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            role: role
          }
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = await getUserRole(user.email!)
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV === 'development'
}

export default NextAuth(authOptions)