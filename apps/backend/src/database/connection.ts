import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { env } from '../config/index.js';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: Database.Database;

  private constructor() {
    const dbPath = path.resolve(env.DATABASE_PATH);

    // Ensure the data directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initTables();

    console.log(`📊 Database connected: ${dbPath}`);
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public getDatabase(): Database.Database {
    return this.db;
  }

  private initTables() {
    // Create media table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS media (
        uniqueId TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        url TEXT NOT NULL,
        source TEXT NOT NULL,
        thumbnail TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('📊 Database tables initialized');
  }

  public close(): void {
    this.db.close();
  }
}

export const dbConnection = DatabaseConnection.getInstance();
export const db = dbConnection.getDatabase();
