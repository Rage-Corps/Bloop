import { db } from '../connection';
import { castMembers, mediaCast } from '../schema';
import { eq, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export interface CastMember {
  id: string;
  name: string;
  createdAt: Date | null;
}

export class CastDao {
  async findOrCreateByName(name: string): Promise<CastMember> {
    const existing = await db
      .select()
      .from(castMembers)
      .where(eq(castMembers.name, name));

    if (existing.length > 0) {
      return existing[0];
    }

    const newCastMember = await db
      .insert(castMembers)
      .values({
        id: randomUUID(),
        name,
      })
      .returning();

    return newCastMember[0];
  }

  async findOrCreateMany(names: string[]): Promise<CastMember[]> {
    if (names.length === 0) {
      return [];
    }

    const results: CastMember[] = [];

    for (const name of names) {
      const castMember = await this.findOrCreateByName(name);
      results.push(castMember);
    }

    return results;
  }

  async getCastByMediaId(mediaId: string): Promise<CastMember[]> {
    const castRelations = await db
      .select({
        id: castMembers.id,
        name: castMembers.name,
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

  async replaceCastForMedia(mediaId: string, castNames: string[]): Promise<void> {
    // Remove existing cast links
    await this.unlinkCastFromMedia(mediaId);

    if (castNames.length === 0) {
      return;
    }

    // Find or create cast members
    const castMemberRecords = await this.findOrCreateMany(castNames);

    // Link cast members to media
    await this.linkCastToMedia(
      mediaId,
      castMemberRecords.map((c) => c.id)
    );
  }

  async getAllCastMembers(): Promise<CastMember[]> {
    return await db.select().from(castMembers);
  }

  async getCastMemberByName(name: string): Promise<CastMember | null> {
    const result = await db
      .select()
      .from(castMembers)
      .where(eq(castMembers.name, name));

    return result.length > 0 ? result[0] : null;
  }
}
