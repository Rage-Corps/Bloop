import { db } from '../connection';
import { watchlist, media, sources, categories } from '../schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { CastDao } from './castDao';

export class WatchlistDao {
  private castDao = new CastDao();

  async getWatchlistByUserId(userId: string): Promise<any[]> {
    const watchlistItems = await db
      .select({
        mediaId: watchlist.mediaId,
      })
      .from(watchlist)
      .where(eq(watchlist.userId, userId))
      .orderBy(desc(watchlist.createdAt));

    const mediaIds = watchlistItems.map((item) => item.mediaId);

    if (mediaIds.length === 0) {
      return [];
    }

    const mediaItems = await db
      .select()
      .from(media)
      .where(inArray(media.id, mediaIds));

    // Get sources, categories, and cast for these media items
    let allSources: any[] = [];
    let allCategories: any[] = [];
    let castByMediaId: Record<string, any[]> = {};

    if (mediaIds.length > 0) {
      allSources = await db
        .select()
        .from(sources)
        .where(inArray(sources.mediaId, mediaIds));

      allCategories = await db
        .select()
        .from(categories)
        .where(inArray(categories.mediaId, mediaIds));

      castByMediaId = await this.castDao.getCastByMediaIds(mediaIds);
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

    // Combine data and maintain watchlist order
    const mediaMap = mediaItems.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<string, any>);

    return mediaIds.map((id) => {
      const item = mediaMap[id];
      if (!item) return null;
      return {
        ...item,
        createdAt: item.createdAt?.toISOString() || null,
        dateAdded: item.dateAdded?.toISOString() || null,
        sources: sourcesByMediaId[item.id] || [],
        categories: categoriesByMediaId[item.id] || [],
        cast: (castByMediaId[item.id] || []).map((c) => c.name),
      };
    }).filter(Boolean);
  }

  async addToWatchlist(userId: string, mediaId: string): Promise<any> {
    const existing = await db
      .select()
      .from(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.mediaId, mediaId)));

    if (existing.length > 0) {
      return existing[0];
    }

    const newItem = await db
      .insert(watchlist)
      .values({
        id: randomUUID(),
        userId,
        mediaId,
      })
      .returning();

    return newItem[0];
  }

  async removeFromWatchlist(userId: string, mediaId: string): Promise<boolean> {
    const result = await db
      .delete(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.mediaId, mediaId)))
      .returning();

    return result.length > 0;
  }

  async isInWatchlist(userId: string, mediaId: string): Promise<boolean> {
    const existing = await db
      .select()
      .from(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.mediaId, mediaId)));

    return existing.length > 0;
  }
}
