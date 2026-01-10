## 1. Database Schema Changes

- [ ] 1.1 Add `rawDescriptionDiv` column to media table in schema.ts
- [ ] 1.2 Create `castMembers` table in schema.ts (id, name, createdAt)
- [ ] 1.3 Create `mediaCast` junction table in schema.ts (id, mediaId, castMemberId, createdAt)
- [ ] 1.4 Remove `cast` text column from media table in schema.ts
- [ ] 1.5 Generate and review Drizzle migration

## 2. DAO Updates

- [ ] 2.1 Create `CastDao` with methods: findOrCreateByName, getCastByMediaId
- [ ] 2.2 Update `MediaDao.createMedia` to handle cast array via junction table
- [ ] 2.3 Update `MediaDao.upsertMedia` to handle cast array via junction table
- [ ] 2.4 Update `MediaDao.getMediaById` to include cast members
- [ ] 2.5 Update `MediaDao.getMediaWithPagination` to include cast members
- [ ] 2.6 Add rawDescriptionDiv to media insert/update operations

## 3. Type Updates

- [ ] 3.1 Update `CreateMediaInput` in shared-types to accept `cast: string[]`
- [ ] 3.2 Update `Media` interface to include `rawDescriptionDiv`
- [ ] 3.3 Add `CastMember` interface to shared-types
- [ ] 3.4 Update `MediaWithMetadata` to include cast members array
- [ ] 3.5 Update `CreateMediaInput` in database package to match

## 4. Scraping Pipeline

- [ ] 4.1 Update `processLink` in temporal-worker to include duration, cast, rawDescriptionDiv
- [ ] 4.2 Update `processLink` in backend ScrapingUtils to include duration, cast, rawDescriptionDiv
- [ ] 4.3 Convert cast array to format expected by DAO

## 5. Testing & Validation

- [ ] 5.1 Test cast member creation and deduplication
- [ ] 5.2 Test media-cast relationship CRUD
- [ ] 5.3 Test scraping pipeline end-to-end with new fields
- [ ] 5.4 Verify API responses include new fields
