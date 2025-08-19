import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@bloop/database';

const authConfig = {
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: `${process.env.AUTH_URL}`,
  secret: process.env.AUTH_SECRET || 'fallback-secret-key',
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://bloop*.smet-server.ddns.net',
  ],
};

export const auth = betterAuth(authConfig) as any;

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
