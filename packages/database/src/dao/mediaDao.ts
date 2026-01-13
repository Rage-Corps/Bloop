import { db } from '../connection';
import { media, sources, categories, castMembers, mediaCast } from '../schema';
import { eq, and, or, inArray, ilike, sql, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { MediaListResponse, MediaQuery } from '@bloop/shared-types';
import { CastDao } from './castDao';

export interface CreateMediaInput {
  name: string;
  description: string;
  thumbnailUrl: string;
  pageUrl: string;
  dateAdded?: string | undefined;
  duration?: string | undefined;
  rawDescriptionDiv?: string | undefined;
  cast?: string[];
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
  duration?: string;
  rawDescriptionDiv?: string;
  cast?: string[];
}

export interface MediaWithDetails {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  pageUrl: string;
  createdAt: Date | null;
  dateAdded: Date | null;
  duration: string | null;
  rawDescriptionDiv: string | null;
  cast: string[];
  sources: Array<{
    id: string;
    sourceName: string;
    url: string;
    createdAt: Date | null;
  }>;
  categories: string[];
}

export class MediaDao {
  private castDao = new CastDao();

  async getAllMedia(): Promise<any[]> {
    return await db.select().from(media).orderBy(desc(media.dateAdded));
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
    const filterCast = (query as any).cast;

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
        .having(
          sql`COUNT(DISTINCT ${categories.category}) = ${filterCategories.length}`
        );

      whereConditions.push(sql`${media.id} IN ${categoriesSubquery}`);
    }

    // For sources: media must have ALL specified sources
    if (filterSources && filterSources.length > 0) {
      // Subquery to find media IDs that have ALL required sources
      const sourcesSubquery = db
        .select({ mediaId: sources.mediaId })
        .from(sources)
        .where(inArray(sources.sourceName, filterSources))
        .groupBy(sources.mediaId)
        .having(
          sql`COUNT(DISTINCT ${sources.sourceName}) = ${filterSources.length}`
        );

      whereConditions.push(sql`${media.id} IN ${sourcesSubquery}`);
    }

    // For cast: media must have ALL specified cast members
    if (filterCast && filterCast.length > 0) {
      // Subquery to find media IDs that have ALL required cast members
      const castSubquery = db
        .select({ mediaId: mediaCast.mediaId })
        .from(mediaCast)
        .innerJoin(castMembers, eq(mediaCast.castMemberId, castMembers.id))
        .where(inArray(castMembers.name, filterCast))
        .groupBy(mediaCast.mediaId)
        .having(
          sql`COUNT(DISTINCT ${castMembers.name}) = ${filterCast.length}`
        );

      whereConditions.push(sql`${media.id} IN ${castSubquery}`);
    }

    // Apply name filter if provided (matches media name OR cast member name)
    if (name) {
      const nameSearchSubquery = db
        .select({ id: media.id })
        .from(media)
        .leftJoin(mediaCast, eq(media.id, mediaCast.mediaId))
        .leftJoin(castMembers, eq(mediaCast.castMemberId, castMembers.id))
        .where(
          or(
            ilike(media.name, `%${name}%`),
            ilike(castMembers.name, `%${name}%`)
          )
        );

      whereConditions.push(sql`${media.id} IN ${nameSearchSubquery}`);
    }

    // Exclude media with specified categories
    if (excludedCategories && excludedCategories.length > 0) {
      // Subquery to find media IDs that have any of the excluded categories
      const excludedMediaSubquery = db
        .select({ mediaId: categories.mediaId })
        .from(categories)
        .where(inArray(categories.category, excludedCategories));

      whereConditions.push(sql`${media.id} NOT IN ${excludedMediaSubquery}`);
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
      .orderBy(desc(media.dateAdded));

    // Get sources, categories, and cast for the paginated media items
    const paginatedMediaIds = mediaItems.map((item) => item.id);

    let allSources: any[] = [];
    let allCategories: any[] = [];
    let castByMediaId: Record<string, any[]> = {};

    if (paginatedMediaIds.length > 0) {
      allSources = await db
        .select()
        .from(sources)
        .where(inArray(sources.mediaId, paginatedMediaIds));

      allCategories = await db
        .select()
        .from(categories)
        .where(inArray(categories.mediaId, paginatedMediaIds));

      castByMediaId = await this.castDao.getCastByMediaIds(paginatedMediaIds);
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
      cast: (castByMediaId[item.id] || []).map((c) => c.name),
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
    const mediaCastMembers = await this.castDao.getCastByMediaId(id);

    return {
      ...mediaItem[0],
      sources: mediaSources,
      categories: mediaCategories.map((c) => c.category),
      cast: mediaCastMembers.map((c) => c.name),
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
        duration: input.duration || null,
        rawDescriptionDiv: input.rawDescriptionDiv || null,
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

    // Create cast member relationships if provided
    if (input.cast && input.cast.length > 0) {
      await this.castDao.replaceCastForMedia(mediaId, input.cast);
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
    if (input.duration !== undefined) updateData.duration = input.duration;
    if (input.rawDescriptionDiv !== undefined)
      updateData.rawDescriptionDiv = input.rawDescriptionDiv;

    const updatedMedia = await db
      .update(media)
      .set(updateData)
      .where(eq(media.id, id))
      .returning();

    // Update cast if provided
    if (input.cast !== undefined) {
      await this.castDao.replaceCastForMedia(id, input.cast);
    }

    return updatedMedia[0];
  }

  async deleteMedia(id: string): Promise<boolean> {
    const existingMedia = await db.select().from(media).where(eq(media.id, id));

    if (existingMedia.length === 0) {
      return false;
    }

    // Delete sources, categories, and cast (cascade should handle this, but being explicit)
    await db.delete(sources).where(eq(sources.mediaId, id));
    await db.delete(categories).where(eq(categories.mediaId, id));
    await this.castDao.unlinkCastFromMedia(id);

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
      const newLinks = validPageLinks.filter(
        (link) => !existingLinks.includes(link)
      );

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
          duration: input.duration || null,
          rawDescriptionDiv: input.rawDescriptionDiv || null,
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

      // Replace cast members if provided
      if (input.cast && input.cast.length > 0) {
        await this.castDao.replaceCastForMedia(mediaId, input.cast);
      } else {
        await this.castDao.unlinkCastFromMedia(mediaId);
      }

      return updatedMedia[0];
    } else {
      // Create new media
      return await this.createMedia(input);
    }
  }
}
