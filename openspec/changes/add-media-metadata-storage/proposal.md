# Change: Add Media Metadata Storage (duration, cast, rawDescriptionDiv)

## Why

The `getMediaLinkInfo` function now extracts additional metadata from scraped pages:
- `duration` - media runtime (already in schema, not wired up)
- `cast` - array of performer names (currently stored as text, needs proper relational table)
- `rawDescriptionDiv` - raw HTML of description for future re-parsing

Cast data should be stored in a normalized many-to-many relationship to enable filtering and querying by cast members across media items.

## What Changes

- **BREAKING** - Remove existing `cast` text column from `media` table
- Add `rawDescriptionDiv` text column to `media` table
- Create new `cast_members` table for unique cast member names
- Create new `media_cast` junction table linking media to cast members
- Update `CreateMediaInput` and `UpdateMediaInput` types to support new cast structure
- Update `MediaDao` to handle cast member relationships
- Wire up scraping pipeline to persist duration, cast, and rawDescriptionDiv

## Impact

- Affected specs: `scraping`
- Affected code:
  - `packages/database/src/schema.ts` - schema changes
  - `packages/database/drizzle/` - new migration
  - `packages/database/src/dao/mediaDao.ts` - DAO updates
  - `packages/shared-types/src/index.ts` - type updates
  - `apps/temporal-worker/src/activities/scraping.ts` - wire up fields
  - `apps/backend/src/utils/ScrapingUtils.ts` - wire up fields
