# Change: Improve Stars Page with Sorting and Filtering

## Why
Users need better control over how they browse cast members on the Stars page. Currently, stars are sorted only by whether they have images (images first) and then alphabetically. Users want to:
1. Choose different sorting options (e.g., by media count, alphabetical)
2. Hide stars without images to focus on well-documented performers
3. See how many media items each star is associated with to identify popular performers

## What Changes
- **Backend API**: Update `/api/cast` endpoint to support:
  - `orderBy` parameter for flexible sorting (name, mediaCount)
  - `hasImage` filter parameter to exclude stars without images
  - Return `mediaCount` field for each cast member
- **Database Layer**: Update `CastDao.getAllCastMembers()` to:
  - Join with `media_cast` table to count media associations
  - Support dynamic sorting by name or media count
  - Filter by image status
- **Frontend UI**: Update `/stars` page to:
  - Add sorting dropdown with options (Name A-Z, Name Z-A, Most Media, Least Media)
  - Add "Hide stars without images" toggle/checkbox
  - Persist sort and filter preferences in user config
- **Component**: Update `CastMemberCard` to display media count next to star name

## Impact
- Affected specs: `specs/ui/spec.md`, `specs/server/spec.md`
- Affected code:
  - `packages/database/src/dao/castDao.ts`
  - `apps/backend/src/routes/cast.ts`
  - `apps/frontend/app/pages/stars.vue`
  - `apps/frontend/app/components/CastMemberCard.vue`
  - `packages/shared-types/src/index.ts` (update CastMember type to include mediaCount)
