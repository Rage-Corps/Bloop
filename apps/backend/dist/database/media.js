import { db } from './connection.js';
class MediaDatabase {
    constructor() {
        // Seed data removed
    }
    // Get all media
    getAllMedia() {
        const stmt = db.prepare('SELECT id, name, description, thumbnailUrl, pageUrl FROM media ORDER BY created_at DESC');
        return stmt.all();
    }
    // Get media by id
    getMediaById(id) {
        const stmt = db.prepare('SELECT id, name, description, thumbnailUrl, pageUrl FROM media WHERE id = ?');
        return stmt.get(id);
    }
    // Add new media
    addMedia(media) {
        const stmt = db.prepare(`
      INSERT INTO media (id, name, description, thumbnailUrl, pageUrl)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(media.id, media.name, media.description, media.thumbnailUrl, media.pageUrl);
    }
    // Update existing media
    updateMedia(id, updates) {
        const fields = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(', ');
        const values = Object.values(updates);
        if (fields.length === 0)
            return false;
        const stmt = db.prepare(`UPDATE media SET ${fields} WHERE id = ?`);
        const result = stmt.run(...values, id);
        return result.changes > 0;
    }
    // Delete media
    deleteMedia(id) {
        const stmt = db.prepare('DELETE FROM media WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    // Check if media exists
    mediaExists(id) {
        const stmt = db.prepare('SELECT 1 FROM media WHERE id = ? LIMIT 1');
        return stmt.get(id) !== undefined;
    }
    // Check if pageUrl exists
    pageUrlExists(pageUrl) {
        const stmt = db.prepare('SELECT 1 FROM media WHERE pageUrl = ? LIMIT 1');
        return stmt.get(pageUrl) !== undefined;
    }
}
export const mediaDatabase = new MediaDatabase();
