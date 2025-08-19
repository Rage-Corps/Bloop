import { db } from '../db/connection';
import { media, sources, categories } from '../db/schema';
import { eq, and, inArray, ilike, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { MediaListResponse, MediaQuery } from '@bloop/shared-types';

export interface CreateMediaInput {
  name: string;
  description: string;
  thumbnailUrl: string;
  pageUrl: string;
  dateAdded?: string | undefined;
  cast?: string | undefined;
  duration?: string | undefined;
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
  dateAdded?: string;
  cast?: string;
  duration?: string;
}

export interface MediaWithDetails {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  pageUrl: string;
  createdAt: Date | null;
  dateAdded: Date | null;
  cast: string | null;
  duration: string | null;
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

export class MediaDao {
  async getAllMedia(): Promise<any[]> {
    return await db.select().from(media);
  }

  async getMediaWithPagination(
    query: MediaQuery = {}
  ): Promise<MediaListResponse> {
    const {
      limit = 20,
      offset = 0,
      name,
      categories: filterCategories,
      sources: filterSources,
      excludedCategories,
    } = query;

    // Build base query with joins for all potential filters
    let mediaIdsQuery = db.selectDistinct({ id: media.id }).from(media);
    const whereConditions: any[] = [];

    // For categories: media must have ALL specified categories
    if (filterCategories && filterCategories.length > 0) {
      // Subquery to find media IDs that have ALL required categories
      const categoriesSubquery = db
        .select({ mediaId: categories.mediaId })
        .from(categories)
        .where(inArray(categories.category, filterCategories))
        .groupBy(categories.mediaId)
        .having(sql`COUNT(DISTINCT ${categories.category}) = ${filterCategories.length}`);
      
      whereConditions.push(
        sql`${media.id} IN ${categoriesSubquery}`
      );
    }

    // For sources: media must have ALL specified sources
    if (filterSources && filterSources.length > 0) {
      // Subquery to find media IDs that have ALL required sources
      const sourcesSubquery = db
        .select({ mediaId: sources.mediaId })
        .from(sources)
        .where(inArray(sources.sourceName, filterSources))
        .groupBy(sources.mediaId)
        .having(sql`COUNT(DISTINCT ${sources.sourceName}) = ${filterSources.length}`);
      
      whereConditions.push(
        sql`${media.id} IN ${sourcesSubquery}`
      );
    }

    // Apply name filter if provided
    if (name) {
      whereConditions.push(ilike(media.name, `%${name}%`));
    }

    // Exclude media with specified categories
    if (excludedCategories && excludedCategories.length > 0) {
      // Subquery to find media IDs that have any of the excluded categories
      const excludedMediaSubquery = db
        .select({ mediaId: categories.mediaId })
        .from(categories)
        .where(inArray(categories.category, excludedCategories));
      
      whereConditions.push(
        sql`${media.id} NOT IN ${excludedMediaSubquery}`
      );
    }

    // Apply all where conditions together (AND logic)
    if (whereConditions.length > 0) {
      mediaIdsQuery = (mediaIdsQuery as any).where(and(...whereConditions));
    }

    // Log the SQL query for debugging
    const sqlQuery = mediaIdsQuery.toSQL();
    console.log('SQL Query:', sqlQuery.sql);
    console.log('SQL Params:', sqlQuery.params);
    
    // Get filtered media IDs
    const filteredMediaIds = await mediaIdsQuery;
    const mediaIds = filteredMediaIds.map((item) => item.id);

    if (mediaIds.length === 0) {
      return {
        data: [],
        total: 0,
        limit,
        offset,
      };
    }

    // Get total count
    const total = mediaIds.length;

    // Get paginated media items using the filtered IDs
    const paginatedIds = mediaIds.slice(offset, offset + limit);

    const mediaItems = await db
      .select()
      .from(media)
      .where(inArray(media.id, paginatedIds))
      .orderBy(media.createdAt);

    // Get sources and categories for the paginated media items
    const paginatedMediaIds = mediaItems.map((item) => item.id);

    let allSources: any[] = [];
    let allCategories: any[] = [];

    if (paginatedMediaIds.length > 0) {
      allSources = await db
        .select()
        .from(sources)
        .where(inArray(sources.mediaId, paginatedMediaIds));

      allCategories = await db
        .select()
        .from(categories)
        .where(inArray(categories.mediaId, paginatedMediaIds));
    }

    // Group sources and categories by mediaId
    const sourcesByMediaId = allSources.reduce(
      (acc, source) => {
        if (!acc[source.mediaId]) acc[source.mediaId] = [];
        acc[source.mediaId].push(source);
        return acc;
      },
      {} as Record<string, any[]>
    );

    const categoriesByMediaId = allCategories.reduce(
      (acc, category) => {
        if (!acc[category.mediaId]) acc[category.mediaId] = [];
        acc[category.mediaId].push(category.category);
        return acc;
      },
      {} as Record<string, string[]>
    );

    // Combine data with proper date formatting
    const data = mediaItems.map((item) => ({
      ...item,
      createdAt: item.createdAt?.toISOString() || null,
      dateAdded: item.dateAdded?.toISOString() || null,
      sources: sourcesByMediaId[item.id] || [],
      categories: categoriesByMediaId[item.id] || [],
    }));

    return {
      data,
      total: Number(total),
      limit,
      offset,
    } as MediaListResponse;
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
        dateAdded: input.dateAdded ? new Date(input.dateAdded) : null,
        cast: input.cast || null,
        duration: input.duration || null,
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

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.thumbnailUrl !== undefined)
      updateData.thumbnailUrl = input.thumbnailUrl;
    if (input.pageUrl !== undefined) updateData.pageUrl = input.pageUrl;
    if (input.dateAdded !== undefined)
      updateData.dateAdded = input.dateAdded ? new Date(input.dateAdded) : null;
    if (input.cast !== undefined) updateData.cast = input.cast;
    if (input.duration !== undefined) updateData.duration = input.duration;

    const updatedMedia = await db
      .update(media)
      .set(updateData)
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

  async checkExistingPageLinks(pageLinks: string[]): Promise<{
    existingCount: number;
    newLinks: string[];
    existingLinks: string[];
  }> {
    // Filter out invalid links (null, undefined, empty strings)
    const validPageLinks = pageLinks.filter(
      (link) => link && typeof link === 'string' && link.trim() !== ''
    );

    if (validPageLinks.length === 0) {
      return {
        existingCount: 0,
        newLinks: [],
        existingLinks: [],
      };
    }

    try {
      // Check which links already exist in the database
      const existingMedia = await db
        .select({ pageUrl: media.pageUrl })
        .from(media)
        .where(inArray(media.pageUrl, validPageLinks));

      const existingLinks = existingMedia.map((item) => item.pageUrl);
      const newLinks = validPageLinks.filter((link) => !existingLinks.includes(link));

      return {
        existingCount: existingLinks.length,
        newLinks,
        existingLinks,
      };
    } catch (error) {
      console.error('❌ Error checking existing page links:', error);
      // Return all links as new if query fails
      return {
        existingCount: 0,
        newLinks: validPageLinks,
        existingLinks: [],
      };
    }
  }

  async upsertMedia(input: CreateMediaInput): Promise<any> {
    // Check if media already exists based on pageUrl
    const existingMedia = await db
      .select()
      .from(media)
      .where(eq(media.pageUrl, input.pageUrl));

    if (existingMedia.length > 0) {
      // Update existing media
      const mediaId = existingMedia[0].id;

      // Update media record
      const updatedMedia = await db
        .update(media)
        .set({
          name: input.name,
          description: input.description,
          thumbnailUrl: input.thumbnailUrl,
          pageUrl: input.pageUrl,
          dateAdded: input.dateAdded ? new Date(input.dateAdded) : null,
          cast: input.cast || null,
          duration: input.duration || null,
        })
        .where(eq(media.id, mediaId))
        .returning();

      // Remove existing sources and categories
      await db.delete(sources).where(eq(sources.mediaId, mediaId));
      await db.delete(categories).where(eq(categories.mediaId, mediaId));

      // Add new sources if provided
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

      // Add new categories if provided
      if (input.categories && input.categories.length > 0) {
        await db.insert(categories).values(
          input.categories.map((category) => ({
            id: randomUUID(),
            mediaId,
            category,
          }))
        );
      }

      return updatedMedia[0];
    } else {
      // Create new media
      return await this.createMedia(input);
    }
  }
}
