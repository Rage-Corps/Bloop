import { db } from '../db/connection';
import { media, sources, categories } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export interface CreateMediaInput {
  name: string;
  description: string;
  thumbnailUrl: string;
  pageUrl: string;
  sources?: Array<{
    sourceName: string;
    url: string;
  }>;
  categories?: string[];
}

export interface UpdateMediaInput {
  name?: string;
  description?: string;
  thumbnailUrl?: string;
  pageUrl?: string;
}

export interface MediaWithDetails {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  pageUrl: string;
  createdAt: Date | null;
  sources: Array<{
    id: string;
    sourceName: string;
    url: string;
    createdAt: Date | null;
  }>;
  categories: Array<{
    id: string;
    category: string;
    createdAt: Date | null;
  }>;
}

export class MediaHelper {
  async getAllMedia(): Promise<any[]> {
    return await db.select().from(media);
  }

  async getMediaById(id: string): Promise<MediaWithDetails | null> {
    const mediaItem = await db.select().from(media).where(eq(media.id, id));

    if (mediaItem.length === 0) {
      return null;
    }

    const mediaSources = await db
      .select()
      .from(sources)
      .where(eq(sources.mediaId, id));
    const mediaCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.mediaId, id));

    return {
      ...mediaItem[0],
      sources: mediaSources,
      categories: mediaCategories,
    };
  }

  async createMedia(input: CreateMediaInput): Promise<any> {
    const mediaId = randomUUID();

    // Create media record
    const newMedia = await db
      .insert(media)
      .values({
        id: mediaId,
        name: input.name,
        description: input.description,
        thumbnailUrl: input.thumbnailUrl,
        pageUrl: input.pageUrl,
      })
      .returning();

    // Create sources if provided
    if (input.sources && input.sources.length > 0) {
      await db.insert(sources).values(
        input.sources.map((source) => ({
          id: randomUUID(),
          mediaId,
          sourceName: source.sourceName,
          url: source.url,
        }))
      );
    }

    // Create categories if provided
    if (input.categories && input.categories.length > 0) {
      await db.insert(categories).values(
        input.categories.map((category) => ({
          id: randomUUID(),
          mediaId,
          category,
        }))
      );
    }

    return newMedia[0];
  }

  async updateMedia(id: string, input: UpdateMediaInput): Promise<any | null> {
    const existingMedia = await db.select().from(media).where(eq(media.id, id));

    if (existingMedia.length === 0) {
      return null;
    }

    const updatedMedia = await db
      .update(media)
      .set(input)
      .where(eq(media.id, id))
      .returning();

    return updatedMedia[0];
  }

  async deleteMedia(id: string): Promise<boolean> {
    const existingMedia = await db.select().from(media).where(eq(media.id, id));

    if (existingMedia.length === 0) {
      return false;
    }

    // Delete sources and categories (cascade should handle this, but being explicit)
    await db.delete(sources).where(eq(sources.mediaId, id));
    await db.delete(categories).where(eq(categories.mediaId, id));

    // Delete media
    await db.delete(media).where(eq(media.id, id));

    return true;
  }

  async addSourceToMedia(
    mediaId: string,
    sourceName: string,
    url: string
  ): Promise<any | null> {
    const existingMedia = await db
      .select()
      .from(media)
      .where(eq(media.id, mediaId));

    if (existingMedia.length === 0) {
      return null;
    }

    const newSource = await db
      .insert(sources)
      .values({
        id: randomUUID(),
        mediaId,
        sourceName,
        url,
      })
      .returning();

    return newSource[0];
  }

  async removeSourceFromMedia(
    mediaId: string,
    sourceId: string
  ): Promise<boolean> {
    const result = await db
      .delete(sources)
      .where(and(eq(sources.mediaId, mediaId), eq(sources.id, sourceId)));

    return result.length > 0;
  }

  async addCategoryToMedia(
    mediaId: string,
    category: string
  ): Promise<any | null> {
    const existingMedia = await db
      .select()
      .from(media)
      .where(eq(media.id, mediaId));

    if (existingMedia.length === 0) {
      return null;
    }

    const newCategory = await db
      .insert(categories)
      .values({
        id: randomUUID(),
        mediaId,
        category,
      })
      .returning();

    return newCategory[0];
  }

  async removeCategoryFromMedia(
    mediaId: string,
    categoryId: string
  ): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(
        and(eq(categories.mediaId, mediaId), eq(categories.id, categoryId))
      );

    return result.length > 0;
  }

  async searchMedia(searchTerm: string): Promise<any[]> {
    // Simple search - can be enhanced with full-text search later
    return await db.select().from(media).where(eq(media.name, searchTerm)); // Simplified - would use LIKE or full-text search
  }

  async mediaExists(pageUrl: string): Promise<boolean> {
    const existing = await db
      .select({ id: media.id })
      .from(media)
      .where(eq(media.pageUrl, pageUrl));
    return existing.length > 0;
  }
}
