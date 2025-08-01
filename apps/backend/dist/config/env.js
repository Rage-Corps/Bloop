import { config } from 'dotenv';
import { z } from 'zod';
// Load environment variables
config();
// Environment validation schema
const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: z.string().transform(Number).default(3001),
    HOST: z.string().default('localhost'),
    DATABASE_PATH: z.string().default('./data/database.db'),
    LOG_LEVEL: z
        .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
        .default('info'),
    BASE_SCRAPE_URL: z
        .string()
        .url('BASE_SCRAPE_URL must be a valid URL')
        .optional(),
});
// Validate and export environment variables
const parseResult = envSchema.safeParse(process.env);
if (!parseResult.success) {
    console.error('❌ Invalid environment variables:', parseResult.error.format());
    process.exit(1);
}
export const env = parseResult.data;
// Helper to check if we're in development
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
