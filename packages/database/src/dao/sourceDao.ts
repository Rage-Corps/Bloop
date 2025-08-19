import { db } from '../connection';
import { sources } from '../schema';

export class SourceDao {
  async getUniqueSources(): Promise<string[]> {
    const result = await db
      .selectDistinct({ sourceName: sources.sourceName })
      .from(sources)
      .orderBy(sources.sourceName);
    
    return result.map(item => item.sourceName);
  }
}