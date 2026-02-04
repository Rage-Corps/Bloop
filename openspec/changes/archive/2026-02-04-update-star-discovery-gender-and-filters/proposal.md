# Proposal: Update Star Discovery Gender and Filtering

This change enhances the star discovery process by capturing and storing the performer's gender. It also improves the `/stars` page user experience by adding a gender filter and defaulting the view to show stars with images.

## User Review Required

> [!IMPORTANT]
> The `/stars` page will now default to "With images" checked and "Gender: Female". This might hide some stars that users expect to see until they change the filters.

## Proposed Changes

### Database

#### [MODIFY] [schema.ts](file:///home/tdk_rage/Projects/tdk_rage/Bloop/packages/database/src/schema.ts)

- Add `gender` column to `cast_members` table.

#### [MODIFY] [castDao.ts](file:///home/tdk_rage/Projects/tdk_rage/Bloop/packages/database/src/dao/castDao.ts)

- Update `CastMember` interface.
- Update `findOrCreateByName` to support `gender`.
- Update `getAllCastMembers` to support `gender` filtering and return `gender`.
- Update `updateImageUrl` to `updateStarInfo` (or keep and add another) to update `gender`.

---

### Shared Types

#### [MODIFY] [index.ts](file:///home/tdk_rage/Projects/tdk_rage/Bloop/packages/shared-types/src/index.ts)

- Update `CastMember` interface to include `gender`.
- Update `FetchCastMembersOptions` to include `gender`.
- Update `UserPreferences` to include `starsGender`.

---

### Scraping (Temporal Worker)

#### [MODIFY] [stars.ts](file:///home/tdk_rage/Projects/tdk_rage/Bloop/apps/temporal-worker/src/activities/stars.ts)

- Update `findStarImage` (maybe rename to `discoverStarInfo`) to return `{ imageUrl, gender }`.
- Update `updateStarImage` to update both `imageUrl` and `gender`.

#### [MODIFY] [starImageDiscoveryWorkflow.ts](file:///home/tdk_rage/Projects/tdk_rage/Bloop/apps/temporal-worker/src/workflows/starImageDiscoveryWorkflow.ts)

- Update workflow to handle updated activity results.

---

### Server (Backend)

#### [MODIFY] [cast.ts](file:///home/tdk_rage/Projects/tdk_rage/Bloop/apps/backend/src/routes/cast.ts)

- Update `GET /api/cast` to accept `gender` query parameter.
- Return `gender` in the response list.

---

### UI (Frontend)

#### [MODIFY] [stars.vue](file:///home/tdk_rage/Projects/tdk_rage/Bloop/apps/frontend/app/pages/stars.vue)

- Add `Gender` select filter (options: All, Female, Male, Transgender).
- Default `Gender` to "Female".
- Default `With images` toggle to `true`.
- Update data loading logic to include `gender` filter.

#### [MODIFY] [useCastMembers.ts](file:///home/tdk_rage/Projects/tdk_rage/Bloop/apps/frontend/app/composables/useCastMembers.ts)

- Update `fetchCastMembers` to pass `gender` to the backend.

## Verification Plan

### Automated Tests

- Run `openspec validate update-star-discovery-gender-and-filters --strict`.

### Manual Verification

- Navigate to `/stars` page and verify default filters (Female, with images).
- Change filters and verify results update correctly.
- Trigger "Discover Images" (if possible/needed for verification) and check if gender is populated in database.
