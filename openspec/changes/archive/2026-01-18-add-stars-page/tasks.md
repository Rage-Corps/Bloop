# Tasks: Add Stars Page

## 1. Database & Schema
- [x] 1.1 Add `imageUrl` column to `cast_members` table in `packages/database/src/schema.ts`.
- [x] 1.2 Generate and run migration.
- [x] 1.3 Update `CastMember` interface and `CastDao` in `packages/database/src/dao/castDao.ts`.

## 2. Backend API
- [x] 2.1 Update `/api/cast` route in `apps/backend/src/routes/cast.ts` to return objects with name and image.
- [x] 2.2 Implement a basic image discovery service/activity in `apps/temporal-worker`.
- [x] 2.3 Add an endpoint to trigger image search for a specific cast member or all missing ones.

## 3. Frontend Composables & Types
- [x] 3.1 Update `CastMember` type in `packages/shared-types/src/index.ts`.
- [x] 3.2 Update `useCastMembers` composable in `apps/frontend/app/composables/useCastMembers.ts`.

## 4. UI Components & Pages
- [x] 4.1 Create `CastMemberCard.vue` component in `apps/frontend/app/components/`.
- [x] 4.2 Create `stars.vue` page in `apps/frontend/app/pages/`.
- [x] 4.3 Add "Stars" link to `apps/frontend/app/layouts/dashboard.vue`.
- [x] 4.4 Implement search and total count on Stars page.

## 5. Verification
- [x] 5.1 Verify Stars page loads and displays cast members.
- [x] 5.2 Verify clicking a star redirects to dashboard with the correct filter.
- [x] 5.3 Verify image discovery works (initially with placeholders or a simple scraper).
