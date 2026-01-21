import { db } from '../connection';
import { sources } from '../schema';
import { eq, count } from 'drizzle-orm';

export class SourceDao {
  async getUniqueSources(): Promise<string[]> {
    const result = await db
      .selectDistinct({ sourceName: sources.sourceName })
      .from(sources)
      .orderBy(sources.sourceName);
    
    return result.map(item => item.sourceName);
  }

  async getAllSources() {
    return await db.select().from(sources);
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
