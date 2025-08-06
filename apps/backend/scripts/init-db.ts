import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dev_user:dev_password@localhost:5432/backend_dev';

async function initializeDatabase() {
  console.log('🔄 Initializing database...');
  
  let migrationClient: postgres.Sql | null = null;
  
  try {
    // Create connection for migrations
    migrationClient = postgres(DATABASE_URL, { max: 1 });
    const db = drizzle(migrationClient);
    
    console.log('📦 Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    
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

// Run initialization
initializeDatabase();