import { db } from './connection.js';
import { randomUUID } from 'crypto';
class JobsDatabase {
    // Create a new job
    createJob(config) {
        const jobId = randomUUID();
        const now = new Date().toISOString();
        const stmt = db.prepare(`
      INSERT INTO scraping_jobs (
        id, status, created_at, base_url, max_pages, force_mode, wait_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(jobId, 'pending', now, config.baseUrl, config.maxPages, config.forceMode ? 1 : 0, config.waitTime);
        return this.getJobById(jobId);
    }
    // Get job by ID
    getJobById(jobId) {
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
        const row = stmt.get(jobId);
        if (!row)
            return undefined;
        return {
            ...row,
            forceMode: Boolean(row.forceMode),
            processedLinks: JSON.parse(row.processedLinks || '[]'),
        };
    }
    // Get all jobs
    getAllJobs() {
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
        const rows = stmt.all();
        return rows.map(row => ({
            ...row,
            forceMode: Boolean(row.forceMode),
            processedLinks: JSON.parse(row.processedLinks || '[]'),
        }));
    }
    // Get active jobs (running or paused)
    getActiveJobs() {
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
        const rows = stmt.all();
        return rows.map(row => ({
            ...row,
            forceMode: Boolean(row.forceMode),
            processedLinks: JSON.parse(row.processedLinks || '[]'),
        }));
    }
    // Update job status
    updateJobStatus(jobId, status, errorMessage) {
        const now = new Date().toISOString();
        let updateFields = ['status = ?'];
        let values = [status];
        if (status === 'running' && !this.getJobById(jobId)?.startedAt) {
            updateFields.push('started_at = ?');
            values.push(now);
        }
        else if (status === 'paused') {
            updateFields.push('paused_at = ?');
            values.push(now);
        }
        else if (['completed', 'failed', 'cancelled'].includes(status)) {
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
    updateJobProgress(jobId, progress) {
        const updates = [];
        const values = [];
        Object.entries(progress).forEach(([key, value]) => {
            if (value !== undefined) {
                const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                if (key === 'processedLinks') {
                    updates.push(`${dbKey} = ?`);
                    values.push(JSON.stringify(value));
                }
                else {
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
    logActivity(jobId, level, message, data) {
        const logId = randomUUID();
        const now = new Date().toISOString();
        const stmt = db.prepare(`
      INSERT INTO job_logs (id, job_id, timestamp, level, message, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(logId, jobId, now, level, message, data ? JSON.stringify(data) : null);
    }
    // Get job logs
    getJobLogs(jobId, limit = 100) {
        const stmt = db.prepare(`
      SELECT 
        id, job_id as jobId, timestamp, level, message, data
      FROM job_logs 
      WHERE job_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
        const rows = stmt.all(jobId, limit);
        return rows.map(row => ({
            ...row,
            data: row.data ? JSON.parse(row.data) : undefined,
        }));
    }
    // Delete old completed jobs (cleanup)
    cleanupOldJobs(olderThanDays = 7) {
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
