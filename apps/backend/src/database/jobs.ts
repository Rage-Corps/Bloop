import { db } from './connection.js';
import { randomUUID } from 'crypto';
import type { ScrapingJob, JobLog } from '../schemas/scraping.js';

class JobsDatabase {
  // Create a new job
  createJob(config: {
    baseUrl: string;
    maxPages: number;
    forceMode: boolean;
    waitTime: number;
  }): ScrapingJob {
    const jobId = randomUUID();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO scraping_jobs (
        id, status, created_at, base_url, max_pages, force_mode, wait_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      jobId,
      'pending',
      now,
      config.baseUrl,
      config.maxPages,
      config.forceMode ? 1 : 0,
      config.waitTime
    );
    
    return this.getJobById(jobId)!;
  }

  // Get job by ID
  getJobById(jobId: string): ScrapingJob | undefined {
    const stmt = db.prepare(`
      SELECT 
        id, status, created_at as createdAt, started_at as startedAt, 
        paused_at as pausedAt, completed_at as completedAt,
        base_url as baseUrl, max_pages as maxPages, 
        force_mode as forceMode, wait_time as waitTime,
        current_page as currentPage, total_pages as totalPages,
        links_total as linksTotal, links_processed as linksProcessed,
        links_skipped as linksSkipped, processed_links as processedLinks,
        error_message as errorMessage
      FROM scraping_jobs WHERE id = ?
    `);
    
    const row = stmt.get(jobId) as any;
    if (!row) return undefined;
    
    return {
      ...row,
      forceMode: Boolean(row.forceMode),
      processedLinks: JSON.parse(row.processedLinks || '[]'),
    };
  }

  // Get all jobs
  getAllJobs(): ScrapingJob[] {
    const stmt = db.prepare(`
      SELECT 
        id, status, created_at as createdAt, started_at as startedAt, 
        paused_at as pausedAt, completed_at as completedAt,
        base_url as baseUrl, max_pages as maxPages, 
        force_mode as forceMode, wait_time as waitTime,
        current_page as currentPage, total_pages as totalPages,
        links_total as linksTotal, links_processed as linksProcessed,
        links_skipped as linksSkipped, processed_links as processedLinks,
        error_message as errorMessage
      FROM scraping_jobs ORDER BY created_at DESC
    `);
    
    const rows = stmt.all() as any[];
    return rows.map(row => ({
      ...row,
      forceMode: Boolean(row.forceMode),
      processedLinks: JSON.parse(row.processedLinks || '[]'),
    }));
  }

  // Get active jobs (running or paused)
  getActiveJobs(): ScrapingJob[] {
    const stmt = db.prepare(`
      SELECT 
        id, status, created_at as createdAt, started_at as startedAt, 
        paused_at as pausedAt, completed_at as completedAt,
        base_url as baseUrl, max_pages as maxPages, 
        force_mode as forceMode, wait_time as waitTime,
        current_page as currentPage, total_pages as totalPages,
        links_total as linksTotal, links_processed as linksProcessed,
        links_skipped as linksSkipped, processed_links as processedLinks,
        error_message as errorMessage
      FROM scraping_jobs 
      WHERE status IN ('running', 'paused', 'pending')
      ORDER BY created_at DESC
    `);
    
    const rows = stmt.all() as any[];
    return rows.map(row => ({
      ...row,
      forceMode: Boolean(row.forceMode),
      processedLinks: JSON.parse(row.processedLinks || '[]'),
    }));
  }

  // Update job status
  updateJobStatus(jobId: string, status: ScrapingJob['status'], errorMessage?: string): void {
    const now = new Date().toISOString();
    let updateFields = ['status = ?'];
    let values: any[] = [status];
    
    if (status === 'running' && !this.getJobById(jobId)?.startedAt) {
      updateFields.push('started_at = ?');
      values.push(now);
    } else if (status === 'paused') {
      updateFields.push('paused_at = ?');
      values.push(now);
    } else if (['completed', 'failed', 'cancelled'].includes(status)) {
      updateFields.push('completed_at = ?');
      values.push(now);
    }
    
    if (errorMessage) {
      updateFields.push('error_message = ?');
      values.push(errorMessage);
    }
    
    values.push(jobId);
    
    const stmt = db.prepare(`
      UPDATE scraping_jobs SET ${updateFields.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);
  }

  // Update job progress
  updateJobProgress(jobId: string, progress: {
    currentPage?: number;
    totalPages?: number;
    linksTotal?: number;
    linksProcessed?: number;
    linksSkipped?: number;
    processedLinks?: string[];
  }): void {
    const updates: string[] = [];
    const values: any[] = [];
    
    Object.entries(progress).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (key === 'processedLinks') {
          updates.push(`${dbKey} = ?`);
          values.push(JSON.stringify(value));
        } else {
          updates.push(`${dbKey} = ?`);
          values.push(value);
        }
      }
    });
    
    if (updates.length > 0) {
      values.push(jobId);
      const stmt = db.prepare(`
        UPDATE scraping_jobs SET ${updates.join(', ')} WHERE id = ?
      `);
      stmt.run(...values);
    }
  }

  // Log job activity
  logActivity(jobId: string, level: JobLog['level'], message: string, data?: Record<string, any>): void {
    const logId = randomUUID();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO job_logs (id, job_id, timestamp, level, message, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      logId,
      jobId,
      now,
      level,
      message,
      data ? JSON.stringify(data) : null
    );
  }

  // Get job logs
  getJobLogs(jobId: string, limit: number = 100): JobLog[] {
    const stmt = db.prepare(`
      SELECT 
        id, job_id as jobId, timestamp, level, message, data
      FROM job_logs 
      WHERE job_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    
    const rows = stmt.all(jobId, limit) as any[];
    return rows.map(row => ({
      ...row,
      data: row.data ? JSON.parse(row.data) : undefined,
    }));
  }

  // Delete old completed jobs (cleanup)
  cleanupOldJobs(olderThanDays: number = 7): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const stmt = db.prepare(`
      DELETE FROM scraping_jobs 
      WHERE status IN ('completed', 'failed', 'cancelled') 
      AND completed_at < ?
    `);
    
    const result = stmt.run(cutoffDate.toISOString());
    return result.changes;
  }
}

export const jobsDatabase = new JobsDatabase();