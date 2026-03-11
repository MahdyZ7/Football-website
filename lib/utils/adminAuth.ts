import { auth } from "../../auth";

export interface AuthenticatedAdmin {
  userId: string;
  userName: string;
}

export async function getAuthenticatedAdmin(): Promise<AuthenticatedAdmin | null> {
  const session = await auth();

  if (!session?.user?.id || !session.user.isAdmin) {
    return null;
  }

  return {
    userId: session.user.id,
    userName: session.user.name || session.user.email || "Admin",
  };
}
