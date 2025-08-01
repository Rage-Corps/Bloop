import { db } from './connection.js';
class SourcesDatabase {
    constructor() {
        // No seed data
    }
    // Get all sources
    getAllSources() {
        const stmt = db.prepare('SELECT id, mediaId, sourceName, url FROM sources ORDER BY created_at DESC');
        return stmt.all();
    }
    // Get source by id
    getSourceById(id) {
        const stmt = db.prepare('SELECT id, mediaId, sourceName, url FROM sources WHERE id = ?');
        return stmt.get(id);
    }
    // Get all sources for a specific media item
    getSourcesByMediaId(mediaId) {
        const stmt = db.prepare('SELECT id, mediaId, sourceName, url FROM sources WHERE mediaId = ? ORDER BY created_at DESC');
        return stmt.all(mediaId);
    }
    // Add new source
    addSource(source) {
        const stmt = db.prepare(`
      INSERT INTO sources (id, mediaId, sourceName, url)
      VALUES (?, ?, ?, ?)
    `);
        stmt.run(source.id, source.mediaId, source.sourceName, source.url);
    }
    // Add multiple sources for a media item
    addSources(sources) {
        const stmt = db.prepare(`
      INSERT INTO sources (id, mediaId, sourceName, url)
      VALUES (?, ?, ?, ?)
    `);
        const transaction = db.transaction(() => {
            for (const source of sources) {
                stmt.run(source.id, source.mediaId, source.sourceName, source.url);
            }
        });
        transaction();
    }
    // Update existing source
    updateSource(id, updates) {
        const fields = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(', ');
        const values = Object.values(updates);
        if (fields.length === 0)
            return false;
        const stmt = db.prepare(`UPDATE sources SET ${fields} WHERE id = ?`);
        const result = stmt.run(...values, id);
        return result.changes > 0;
    }
    // Delete source
    deleteSource(id) {
        const stmt = db.prepare('DELETE FROM sources WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    // Delete all sources for a media item
    deleteSourcesByMediaId(mediaId) {
        const stmt = db.prepare('DELETE FROM sources WHERE mediaId = ?');
        const result = stmt.run(mediaId);
        return result.changes;
    }
    // Check if source exists
    sourceExists(id) {
        const stmt = db.prepare('SELECT 1 FROM sources WHERE id = ? LIMIT 1');
        return stmt.get(id) !== undefined;
    }
    // Count sources for a media item
    countSourcesByMediaId(mediaId) {
        const stmt = db.prepare('SELECT COUNT(*) as count FROM sources WHERE mediaId = ?');
        const result = stmt.get(mediaId);
        return result.count;
    }
}
export const sourcesDatabase = new SourcesDatabase();
