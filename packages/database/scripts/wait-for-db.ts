import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dev_user:dev_password@localhost:5432/backend_dev';

// Parse the database URL to get connection details
function parseDbUrl(url: string) {
  const urlObj = new URL(url);
  return {
    user: urlObj.username,
    password: urlObj.password,
    host: urlObj.hostname,
    port: parseInt(urlObj.port) || 5432,
    database: urlObj.pathname.slice(1), // Remove leading slash
  };
}

async function waitForDatabase() {
  console.log('⏳ Waiting for database to be ready...');
  
  const dbConfig = parseDbUrl(DATABASE_URL);
  const maxAttempts = 30; // 30 seconds
  let attempt = 0;
  
  // First, wait for PostgreSQL server to be ready and create database if needed
  while (attempt < maxAttempts) {
    try {
      // Connect to the default 'postgres' database to check if our target database exists
      const adminSql = postgres({
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.user,
        password: dbConfig.password,
        database: 'postgres', // Connect to default postgres database
        max: 1,
        connect_timeout: 5
      });
      
      // Check if target database exists
      const result = await adminSql`
        SELECT 1 FROM pg_database WHERE datname = ${dbConfig.database}
      `;
      
      if (result.length === 0) {
        console.log(`🔧 Creating database '${dbConfig.database}'...`);
        await adminSql.unsafe(`CREATE DATABASE "${dbConfig.database}"`);
        console.log(`✅ Database '${dbConfig.database}' created successfully!`);
      }
      
      await adminSql.end();
      
      // Now test connection to our target database
      const targetSql = postgres(DATABASE_URL, { max: 1, connect_timeout: 5 });
      await targetSql`SELECT 1`;
      await targetSql.end();
      
      console.log('✅ Database is ready!');
      return;
      
    } catch (error) {
      attempt++;
      console.log(`📍 Database not ready yet (attempt ${attempt}/${maxAttempts}). Retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    }
  }
  
  console.error('❌ Database failed to become ready within 30 seconds');
  process.exit(1);
}

// Run wait for database
waitForDatabase();