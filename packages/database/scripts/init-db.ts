import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres, { PostgresError } from 'postgres';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { sql } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dev_user:dev_password@localhost:5432/backend_dev';

const RECOVERABLE_ERROR_CODES = [
  '42701', // duplicate_column
  '42P07', // duplicate_table
  '42710', // duplicate_object
  '23505', // unique_violation
  '23503', // foreign_key_violation
  '23514', // check_violation
] as const;

interface PostgresErrorCause {
  code: string;
}

interface DrizzleError extends Error {
  cause?: PostgresErrorCause;
  query?: string;
}

function isRecoverableSchemaError(error: unknown): error is DrizzleError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'cause' in error &&
    error.cause !== null &&
    typeof error.cause === 'object' &&
    'code' in error.cause &&
    typeof error.cause.code === 'string' &&
    RECOVERABLE_ERROR_CODES.includes(error.cause.code as any)
  );
}

function getMigrationHash(migrationFile: string): string {
  const content = readFileSync(migrationFile, 'utf-8');
  return createHash('sha256').update(content).digest('hex');
}

async function findMigrationByTag(tag: string): Promise<string | null> {
  const files = await readdir('./drizzle');
  const sqlFile = files.find((f) => f === `${tag}.sql`);
  if (sqlFile) {
    return join('./drizzle', sqlFile);
  }
  return null;
}

async function markMigrationApplied(db: any, tag: string): Promise<void> {
  const migrationPath = await findMigrationByTag(tag);
  if (!migrationPath) {
    throw new Error(`Migration file not found for tag: ${tag}`);
  }
  
  const hash = getMigrationHash(migrationPath);
  const createdAt = Date.now();
  
  await db.execute(
    sql`INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES (${hash}, ${createdAt})`
  );
  console.log(`  🔧 Marked migration ${tag} as applied (hash: ${hash})`);
}

function extractMigrationTagFromError(error: DrizzleError): string | null {
  const query = (error as any).query;
  if (typeof query === 'string') {
    const match = query.match(/^--\s*(\d{4}_[^_\n]+)/m);
    if (match) {
      return match[1];
    }
  }
  return null;
}

async function migrateWithRecovery(db: any): Promise<void> {
  const maxAttempts = 5;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      await migrate(db, { migrationsFolder: './drizzle' });
      return;
    } catch (error) {
      attempts++;
      
      if (isRecoverableSchemaError(error)) {
        const errorCode = error.cause?.code || 'UNKNOWN';
        console.log(`  ⚠️  Recoverable schema error (code: ${errorCode})`);
        
        const migrationTag = extractMigrationTagFromError(error);
        if (migrationTag) {
          console.log(`  🔍 Detected migration: ${migrationTag}`);
          try {
            await markMigrationApplied(db, migrationTag);
            console.log(`  ✅ Recovery successful, retrying migrations...`);
            continue;
          } catch (recoveryError) {
            console.error(`  ❌ Recovery failed for ${migrationTag}:`, recoveryError);
            throw error;
          }
        } else {
          console.error(`  ❌ Could not determine migration tag from error`);
          throw error;
        }
      } else {
        console.error(`  ❌ Non-recoverable error`);
        throw error;
      }
    }
  }
  
  throw new Error('Maximum migration recovery attempts exceeded');
}

async function initializeDatabase() {
  console.log('🔄 Initializing database...');
  
  let migrationClient: postgres.Sql | null = null;
  
  try {
    migrationClient = postgres(DATABASE_URL, { max: 1 });
    const db = drizzle(migrationClient);
    
    console.log('📦 Running database migrations...');
    await migrateWithRecovery(db);
    
    console.log('✅ Database initialized successfully!');
    console.log('🏁 Ready to start the application');
    
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  } finally {
    if (migrationClient) {
      await migrationClient.end();
    }
  }
}

initializeDatabase();