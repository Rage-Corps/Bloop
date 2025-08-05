import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./src/db/connection";

const authConfig = {
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (how often to update the session)
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
  },
} as const;

export const auth = betterAuth(authConfig) as any;

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;