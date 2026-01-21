import { db } from '../connection';
import { sources } from '../schema';
import { eq, count, asc, sql } from 'drizzle-orm';

export class SourceDao {
  async getUniqueSources(): Promise<string[]> {
    const result = await db
      .selectDistinct({ sourceName: sources.sourceName })
      .from(sources)
      .orderBy(sources.sourceName);
    
    return result.map(item => item.sourceName);
  }

  async getAllSources() {
    return await db
      .select({
        id: sources.id,
        url: sources.url,
        mediaId: sources.mediaId,
      })
      .from(sources);
  }

  async getSourcesPaginated(options: { limit?: number; offset?: number } = {}) {
    const limit = options.limit ?? 100;
    const offset = options.offset ?? 0;

    const [countResult, data] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(sources),
      db
        .select({
          id: sources.id,
          url: sources.url,
          mediaId: sources.mediaId,
        })
        .from(sources)
        .orderBy(asc(sources.id))
        .limit(limit)
        .offset(offset),
    ]);

    return {
      data,
      total: Number(countResult[0].count),
      limit,
      offset,
    };
  }

  async deleteSource(id: string) {
    return await db.delete(sources).where(eq(sources.id, id)).returning();
  }

  async countSourcesForMedia(mediaId: string): Promise<number> {
    const result = await db
      .select({ value: count() })
      .from(sources)
      .where(eq(sources.mediaId, mediaId));
    
    return result[0].value;
  }
}
