## Context

The scraper extracts `duration`, `cast`, and `rawDescriptionDiv` from media pages, but only `duration` is partially wired to the database. Cast is stored as a text field which prevents relational queries. The user wants to enable filtering by cast members.

## Goals / Non-Goals

- Goals:
  - Store all scraped metadata (duration, cast, rawDescriptionDiv)
  - Enable many-to-many relationship between media and cast members
  - Support filtering media by cast member name
  - Preserve existing `duration` column (already in schema)

- Non-Goals:
  - Cast member profiles/metadata (just names for now)
  - Full-text search on rawDescriptionDiv
  - Cast member deduplication beyond exact name match

## Decisions

### Decision: Many-to-Many Cast Relationship

Create a normalized structure with:
1. `cast_members` table - stores unique cast member names
2. `media_cast` junction table - links media to cast members

Rationale:
- Enables efficient queries like "find all media with cast member X"
- Reduces storage by deduplicating cast member names
- Follows same pattern as categories (but normalized)

Alternatives considered:
- **One-to-Many (like categories)**: Simpler but creates duplicate cast names per media. Rejected because cast members appear across many media items.
- **Keep as text column**: Simplest but no relational queries. Rejected per user requirement.

### Decision: Remove `cast` text column

The existing `cast` text column in the `media` table should be removed and replaced with the junction table approach.

Rationale:
- Avoids data duplication
- Clean migration path - existing text data is likely minimal or empty
- Prevents confusion about which source of truth to use

### Decision: Add `rawDescriptionDiv` as text column

Store the raw HTML in a simple text column on the `media` table.

Rationale:
- Enables future re-parsing if extraction logic changes
- Simple storage, no complex structure needed
- Can be large, but text columns handle this well in PostgreSQL

## Schema Changes

```sql
-- New cast_members table
CREATE TABLE cast_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- New media_cast junction table
CREATE TABLE media_cast (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  cast_member_id TEXT NOT NULL REFERENCES cast_members(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(media_id, cast_member_id)
);

-- Add rawDescriptionDiv to media table
ALTER TABLE media ADD COLUMN raw_description_div TEXT;

-- Remove old cast column (breaking change)
ALTER TABLE media DROP COLUMN cast;
```

## Risks / Trade-offs

- **Breaking change**: Removing `cast` column requires migration. Existing data will be lost unless migrated.
  - Mitigation: Migration script should convert existing text data to new structure if any exists.

- **Performance**: Many-to-many joins can be slower for large datasets.
  - Mitigation: Add indexes on junction table foreign keys (Drizzle does this automatically for references).

- **Name matching**: Cast members matched by exact name only.
  - Mitigation: Acceptable for MVP. Can add fuzzy matching later.

## Migration Plan

1. Create new tables (`cast_members`, `media_cast`)
2. Add `raw_description_div` column to media
3. Migrate existing `cast` text data to new structure (if any)
4. Drop `cast` column from media
5. Update DAO and types
6. Wire up scraping pipeline

Rollback:
- Re-add `cast` text column
- Drop new tables
- Restore from backup if needed

## Open Questions

- None currently
