import { db } from '../connection';
import { castMembers, mediaCast } from '../schema';
import { eq, ilike, inArray, isNull, sql, asc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export interface CastMember {
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt: Date | null;
}

export class CastDao {
  async findOrCreateByName(name: string, imageUrl?: string | null): Promise<CastMember> {
    const existing = await db
      .select()
      .from(castMembers)
      .where(eq(castMembers.name, name));

    if (existing.length > 0) {
      if (imageUrl && existing[0].imageUrl !== imageUrl) {
        const updated = await db
          .update(castMembers)
          .set({ imageUrl })
          .where(eq(castMembers.id, existing[0].id))
          .returning();
        return updated[0];
      }
      return existing[0];
    }

    const newCastMember = await db
      .insert(castMembers)
      .values({
        id: randomUUID(),
        name,
        imageUrl,
      })
      .returning();

    return newCastMember[0];
  }

  async findOrCreateMany(cast: (string | { name: string, imageUrl?: string | null })[]): Promise<CastMember[]> {
    if (cast.length === 0) {
      return [];
    }

    const results: CastMember[] = [];

    for (const item of cast) {
      const name = typeof item === 'string' ? item : item.name;
      const imageUrl = typeof item === 'string' ? undefined : item.imageUrl;
      const castMember = await this.findOrCreateByName(name, imageUrl);
      results.push(castMember);
    }

    return results;
  }

  async getCastByMediaId(mediaId: string): Promise<CastMember[]> {
    const castRelations = await db
      .select({
        id: castMembers.id,
        name: castMembers.name,
        imageUrl: castMembers.imageUrl,
        createdAt: castMembers.createdAt,
      })
      .from(mediaCast)
      .innerJoin(castMembers, eq(mediaCast.castMemberId, castMembers.id))
      .where(eq(mediaCast.mediaId, mediaId));

    return castRelations;
  }

  async getCastByMediaIds(mediaIds: string[]): Promise<Record<string, CastMember[]>> {
    if (mediaIds.length === 0) {
      return {};
    }

    const castRelations = await db
      .select({
        mediaId: mediaCast.mediaId,
        id: castMembers.id,
        name: castMembers.name,
        imageUrl: castMembers.imageUrl,
        createdAt: castMembers.createdAt,
      })
      .from(mediaCast)
      .innerJoin(castMembers, eq(mediaCast.castMemberId, castMembers.id))
      .where(inArray(mediaCast.mediaId, mediaIds));

    const result: Record<string, CastMember[]> = {};

    for (const relation of castRelations) {
      if (!result[relation.mediaId]) {
        result[relation.mediaId] = [];
      }
      result[relation.mediaId].push({
        id: relation.id,
        name: relation.name,
        imageUrl: relation.imageUrl,
        createdAt: relation.createdAt,
      });
    }

    return result;
  }

  async linkCastToMedia(mediaId: string, castMemberIds: string[]): Promise<void> {
    if (castMemberIds.length === 0) {
      return;
    }

    await db.insert(mediaCast).values(
      castMemberIds.map((castMemberId) => ({
        id: randomUUID(),
        mediaId,
        castMemberId,
      }))
    );
  }

  async unlinkCastFromMedia(mediaId: string): Promise<void> {
    await db.delete(mediaCast).where(eq(mediaCast.mediaId, mediaId));
  }

  async replaceCastForMedia(mediaId: string, cast: (string | { name: string, imageUrl?: string | null })[]): Promise<void> {
    // Remove existing cast links
    await this.unlinkCastFromMedia(mediaId);

    if (cast.length === 0) {
      return;
    }

    // Find or create cast members
    const castMemberRecords = await this.findOrCreateMany(cast);

    // Link cast members to media
    await this.linkCastToMedia(
      mediaId,
      castMemberRecords.map((c) => c.id)
    );
  }

  async getAllCastMembers(filter?: {
    name?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: CastMember[], total: number, limit: number, offset: number }> {
    const limit = filter?.limit ?? 20;
    const offset = filter?.offset ?? 0;

    let baseQuery = db.select().from(castMembers);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(castMembers);

    if (filter?.name) {
      const nameFilter = ilike(castMembers.name, `%${filter.name}%`);
      // @ts-ignore
      baseQuery = baseQuery.where(nameFilter);
      // @ts-ignore
      countQuery = countQuery.where(nameFilter);
    }

    // Get total count
    const countResult = await countQuery;
    const total = Number(countResult[0].count);

    // Apply sorting: images first (IS NULL = false comes before true), then alphabetically by name
    const data = await baseQuery
      .orderBy(
        asc(sql`(${castMembers.imageUrl} IS NULL)`),
        asc(castMembers.name)
      )
      .limit(limit)
      .offset(offset);

    return {
      data,
      total,
      limit,
      offset
    };
  }

  async getCastMemberByName(name: string): Promise<CastMember | null> {
    return this.getByName(name);
  }

  async getByName(name: string): Promise<CastMember | null> {
    const result = await db
      .select()
      .from(castMembers)
      .where(eq(castMembers.name, name));

    return result.length > 0 ? result[0] : null;
  }

  async updateImageUrl(id: string, imageUrl: string): Promise<void> {
    await db
      .update(castMembers)
      .set({ imageUrl })
      .where(eq(castMembers.id, id));
  }

  async getCastWithoutImages(): Promise<CastMember[]> {
    return await db
      .select()
      .from(castMembers)
      .where(isNull(castMembers.imageUrl));
  }

  async deleteOrphanedCastMembers(castMemberIds: string[]): Promise<number> {
    if (castMemberIds.length === 0) {
      return 0;
    }

    // Find which of these cast members have no media associations
    const castWithMedia = await db
      .select({ castMemberId: mediaCast.castMemberId })
      .from(mediaCast)
      .where(inArray(mediaCast.castMemberId, castMemberIds));

    const castIdsWithMedia = new Set(castWithMedia.map((c) => c.castMemberId));
    const orphanedIds = castMemberIds.filter((id) => !castIdsWithMedia.has(id));

    if (orphanedIds.length === 0) {
      return 0;
    }

    await db.delete(castMembers).where(inArray(castMembers.id, orphanedIds));
    return orphanedIds.length;
  }
}
