import { auth } from "@leconn/auth";
import { db } from "@leconn/db";

// 1. Infer the specific types from your auth instance
type AuthSession = typeof auth.$Infer.Session; // This is { session, user }
type Session = AuthSession["session"] | null;
type User = AuthSession["user"] | null;

// 2. Define your Context shape explicitly
export interface AppContext {
  db: typeof db;
  session: Session;
  user: User;
}

export async function createContext({
  req,
}: {
  req: Request;
}): Promise<AppContext> {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  return {
    db,
    session: session?.session ?? null,
    user: session?.user ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
