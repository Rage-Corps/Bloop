import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db/connection';

const authConfig = {
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: `http://${process.env.HOST || 'localhost'}:${process.env.PORT || '3001'}`,
  secret: process.env.AUTH_SECRET || 'fallback-secret-key',
  trustedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
};

export const auth = betterAuth(authConfig) as any;

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
