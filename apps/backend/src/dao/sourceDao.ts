import { db } from '../db/connection';
import { sources } from '../db/schema';

export class SourceDao {
  async getUniqueSources(): Promise<string[]> {
    const result = await db
      .selectDistinct({ sourceName: sources.sourceName })
      .from(sources)
      .orderBy(sources.sourceName);
    
    return result.map(item => item.sourceName);
  }
}