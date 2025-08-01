import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { env } from '../config/index.js';
class DatabaseConnection {
    static instance;
    db;
    constructor() {
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
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    getDatabase() {
        return this.db;
    }
    initTables() {
        // Create media table if it doesn't exist
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        thumbnailUrl TEXT NOT NULL,
        pageUrl TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Create sources table if it doesn't exist
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS sources (
        id TEXT PRIMARY KEY,
        mediaId TEXT NOT NULL,
        sourceName TEXT NOT NULL,
        url TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mediaId) REFERENCES media (id) ON DELETE CASCADE
      )
    `);
        // Create scraping_jobs table for persistent job management
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS scraping_jobs (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        started_at DATETIME,
        paused_at DATETIME,
        completed_at DATETIME,
        
        -- Configuration
        base_url TEXT NOT NULL,
        max_pages INTEGER DEFAULT 1,
        force_mode BOOLEAN DEFAULT FALSE,
        wait_time INTEGER DEFAULT 1000,
        
        -- Progress tracking
        current_page INTEGER DEFAULT 1,
        total_pages INTEGER DEFAULT 1,
        links_total INTEGER DEFAULT 0,
        links_processed INTEGER DEFAULT 0,
        links_skipped INTEGER DEFAULT 0,
        
        -- State persistence
        processed_links TEXT DEFAULT '[]',
        error_message TEXT
      )
    `);
        // Create job_logs table for detailed tracking
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS job_logs (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        data TEXT,
        FOREIGN KEY (job_id) REFERENCES scraping_jobs (id) ON DELETE CASCADE
      )
    `);
        console.log('📊 Database tables initialized');
    }
    close() {
        this.db.close();
    }
}
export const dbConnection = DatabaseConnection.getInstance();
export const db = dbConnection.getDatabase();
