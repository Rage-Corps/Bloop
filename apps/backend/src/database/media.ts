import { db } from './connection.js';
import type { Media } from '../schemas/media.js';

class MediaDatabase {
  constructor() {
    this.seedDummyData();
  }

  private seedDummyData() {
    // Check if we already have data
    const count = db.prepare('SELECT COUNT(*) as count FROM media').get() as {
      count: number;
    };

    if (count.count > 0) {
      console.log(`📦 Database already has ${count.count} media items`);
      return;
    }

    // Dummy data
    const dummyMedia: Media[] = [
      {
        uniqueId: 'media_001',
        name: 'Beautiful Sunset',
        description:
          'A stunning sunset over the mountains with vibrant orange and pink colors',
        url: 'https://example.com/media/sunset.jpg',
        source: 'Nature Photography',
        thumbnail: 'https://example.com/thumbs/sunset_thumb.jpg',
      },
      {
        uniqueId: 'media_002',
        name: 'City Skyline',
        description:
          'Modern city skyline at night with illuminated skyscrapers',
        url: 'https://example.com/media/city.jpg',
        source: 'Urban Photos',
        thumbnail: 'https://example.com/thumbs/city_thumb.jpg',
      },
      {
        uniqueId: 'media_003',
        name: 'Ocean Waves',
        description: 'Peaceful ocean waves crashing on a sandy beach',
        url: 'https://example.com/media/ocean.jpg',
        source: 'Beach Collection',
        thumbnail: 'https://example.com/thumbs/ocean_thumb.jpg',
      },
      {
        uniqueId: 'media_004',
        name: 'Forest Path',
        description: 'A winding path through a lush green forest in autumn',
        url: 'https://example.com/media/forest.jpg',
        source: 'Nature Photography',
        thumbnail: 'https://example.com/thumbs/forest_thumb.jpg',
      },
      {
        uniqueId: 'media_005',
        name: 'Mountain Peak',
        description: 'Snow-capped mountain peak against a clear blue sky',
        url: 'https://example.com/media/mountain.jpg',
        source: 'Adventure Photos',
        thumbnail: 'https://example.com/thumbs/mountain_thumb.jpg',
      },
    ];

    // Insert dummy data
    const insertStmt = db.prepare(`
      INSERT INTO media (uniqueId, name, description, url, source, thumbnail)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const media of dummyMedia) {
      insertStmt.run(
        media.uniqueId,
        media.name,
        media.description,
        media.url,
        media.source,
        media.thumbnail
      );
    }

    console.log(`📦 Added ${dummyMedia.length} dummy media items to database`);
  }

  // Get all media
  getAllMedia(): Media[] {
    const stmt = db.prepare(
      'SELECT uniqueId, name, description, url, source, thumbnail FROM media ORDER BY created_at DESC'
    );
    return stmt.all() as Media[];
  }

  // Get media by uniqueId
  getMediaById(uniqueId: string): Media | undefined {
    const stmt = db.prepare(
      'SELECT uniqueId, name, description, url, source, thumbnail FROM media WHERE uniqueId = ?'
    );
    return stmt.get(uniqueId) as Media | undefined;
  }

  // Add new media
  addMedia(media: Media): void {
    const stmt = db.prepare(`
      INSERT INTO media (uniqueId, name, description, url, source, thumbnail)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      media.uniqueId,
      media.name,
      media.description,
      media.url,
      media.source,
      media.thumbnail
    );
  }

  // Update existing media
  updateMedia(
    uniqueId: string,
    updates: Partial<Omit<Media, 'uniqueId'>>
  ): boolean {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);

    if (fields.length === 0) return false;

    const stmt = db.prepare(`UPDATE media SET ${fields} WHERE uniqueId = ?`);
    const result = stmt.run(...values, uniqueId);
    return result.changes > 0;
  }

  // Delete media
  deleteMedia(uniqueId: string): boolean {
    const stmt = db.prepare('DELETE FROM media WHERE uniqueId = ?');
    const result = stmt.run(uniqueId);
    return result.changes > 0;
  }

  // Check if media exists
  mediaExists(uniqueId: string): boolean {
    const stmt = db.prepare('SELECT 1 FROM media WHERE uniqueId = ? LIMIT 1');
    return stmt.get(uniqueId) !== undefined;
  }
}

export const mediaDatabase = new MediaDatabase();
