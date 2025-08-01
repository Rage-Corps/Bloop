import { db } from './connection.js';
import type { Source } from '../schemas/sources.js';

class SourcesDatabase {
  constructor() {
    // No seed data
  }

  // Get all sources
  getAllSources(): Source[] {
    const stmt = db.prepare(
      'SELECT id, mediaId, sourceName, url FROM sources ORDER BY created_at DESC'
    );
    return stmt.all() as Source[];
  }

  // Get source by id
  getSourceById(id: string): Source | undefined {
    const stmt = db.prepare(
      'SELECT id, mediaId, sourceName, url FROM sources WHERE id = ?'
    );
    return stmt.get(id) as Source | undefined;
  }

  // Get all sources for a specific media item
  getSourcesByMediaId(mediaId: string): Source[] {
    const stmt = db.prepare(
      'SELECT id, mediaId, sourceName, url FROM sources WHERE mediaId = ? ORDER BY created_at DESC'
    );
    return stmt.all(mediaId) as Source[];
  }

  // Add new source
  addSource(source: Source): void {
    const stmt = db.prepare(`
      INSERT INTO sources (id, mediaId, sourceName, url)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(
      source.id,
      source.mediaId,
      source.sourceName,
      source.url
    );
  }

  // Add multiple sources for a media item
  addSources(sources: Source[]): void {
    const stmt = db.prepare(`
      INSERT INTO sources (id, mediaId, sourceName, url)
      VALUES (?, ?, ?, ?)
    `);
    
    const transaction = db.transaction(() => {
      for (const source of sources) {
        stmt.run(
          source.id,
          source.mediaId,
          source.sourceName,
          source.url
        );
      }
    });
    
    transaction();
  }

  // Update existing source
  updateSource(
    id: string,
    updates: Partial<Omit<Source, 'id'>>
  ): boolean {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);

    if (fields.length === 0) return false;

    const stmt = db.prepare(`UPDATE sources SET ${fields} WHERE id = ?`);
    const result = stmt.run(...values, id);
    return result.changes > 0;
  }

  // Delete source
  deleteSource(id: string): boolean {
    const stmt = db.prepare('DELETE FROM sources WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Delete all sources for a media item
  deleteSourcesByMediaId(mediaId: string): number {
    const stmt = db.prepare('DELETE FROM sources WHERE mediaId = ?');
    const result = stmt.run(mediaId);
    return result.changes;
  }

  // Check if source exists
  sourceExists(id: string): boolean {
    const stmt = db.prepare('SELECT 1 FROM sources WHERE id = ? LIMIT 1');
    return stmt.get(id) !== undefined;
  }

  // Count sources for a media item
  countSourcesByMediaId(mediaId: string): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM sources WHERE mediaId = ?');
    const result = stmt.get(mediaId) as { count: number };
    return result.count;
  }
}

export const sourcesDatabase = new SourcesDatabase();