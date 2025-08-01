import { betterAuth } from 'better-auth';
import { env } from './env.js';
import path from 'path';
import Database from 'better-sqlite3';

export const auth = betterAuth({
  database: new Database(path.resolve(env.DATABASE_PATH)),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: `http://${env.HOST}:${env.PORT}`,
  secret: env.AUTH_SECRET,
});
