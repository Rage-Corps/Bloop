import { db } from './connection.js';
import type { Media } from '../schemas/media.js';
import { categoriesDatabase } from './categories.js';
import { sourcesDatabase } from './sources.js';

class MediaDatabase {
  constructor() {
    // Seed data removed
  }

  // Get all media
  getAllMedia(): Media[] {
    const stmt = db.prepare(
      'SELECT id, name, description, thumbnailUrl, pageUrl FROM media ORDER BY created_at DESC'
    );
    const media = stmt.all() as Media[];
    
    // Add categories and sources to each media item
    return media.map(item => ({
      ...item,
      categories: categoriesDatabase.getCategoryNamesByMediaId(item.id),
      sources: sourcesDatabase.getSourcesByMediaId(item.id)
    }));
  }

  // Get media by id
  getMediaById(id: string): Media | undefined {
    const stmt = db.prepare(
      'SELECT id, name, description, thumbnailUrl, pageUrl FROM media WHERE id = ?'
    );
    const media = stmt.get(id) as Media | undefined;
    
    if (media) {
      return {
        ...media,
        categories: categoriesDatabase.getCategoryNamesByMediaId(media.id),
        sources: sourcesDatabase.getSourcesByMediaId(media.id)
      };
    }
    
    return undefined;
  }

  // Add new media
  addMedia(media: Media): void {
    const stmt = db.prepare(`
      INSERT INTO media (id, name, description, thumbnailUrl, pageUrl)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      media.id,
      media.name,
      media.description,
      media.thumbnailUrl,
      media.pageUrl
    );
  }

  // Update existing media
  updateMedia(
    id: string,
    updates: Partial<Omit<Media, 'id'>>
  ): boolean {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);

    if (fields.length === 0) return false;

    const stmt = db.prepare(`UPDATE media SET ${fields} WHERE id = ?`);
    const result = stmt.run(...values, id);
    return result.changes > 0;
  }

  // Delete media
  deleteMedia(id: string): boolean {
    const stmt = db.prepare('DELETE FROM media WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Check if media exists
  mediaExists(id: string): boolean {
    const stmt = db.prepare('SELECT 1 FROM media WHERE id = ? LIMIT 1');
    return stmt.get(id) !== undefined;
  }

  // Check if pageUrl exists
  pageUrlExists(pageUrl: string): boolean {
    const stmt = db.prepare('SELECT 1 FROM media WHERE pageUrl = ? LIMIT 1');
    return stmt.get(pageUrl) !== undefined;
  }

  // Get media by pageUrl
  getMediaByPageUrl(pageUrl: string): Media | undefined {
    const stmt = db.prepare(
      'SELECT id, name, description, thumbnailUrl, pageUrl FROM media WHERE pageUrl = ?'
    );
    const media = stmt.get(pageUrl) as Media | undefined;
    
    if (media) {
      return {
        ...media,
        categories: categoriesDatabase.getCategoryNamesByMediaId(media.id),
        sources: sourcesDatabase.getSourcesByMediaId(media.id)
      };
    }
    
    return undefined;
  }
}

export const mediaDatabase = new MediaDatabase();
