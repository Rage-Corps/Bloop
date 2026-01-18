# Change: Add Stars Page

## Why
Users want a dedicated page to browse media by cast member (specifically adult actors). This provides a more intuitive way to discover content based on their favorite performers, similar to the main dashboard but centered on the stars themselves.

## What Changes
- **Database**: Update `cast_members` table to include an `imageUrl` field.
- **Backend API**: Update `/api/cast` endpoint to return cast member objects (name and image) instead of just names.
- **Frontend UI**: 
    - Add a "Stars" page (`/stars`) displaying a grid of cast member cards.
    - Add navigation link to the Stars page in the dashboard layout.
    - Create a `CastMemberCard` component for displaying performer name and image.
    - Update `useCastMembers` composable to handle the new object-based response.

## Impact
- Affected specs: `specs/config/spec.md`, `specs/server/spec.md`, `specs/ui/spec.md`, `specs/scraping/spec.md`
- Affected code:
    - `packages/database/src/schema.ts`
    - `apps/backend/src/routes/cast.ts`
    - `apps/frontend/app/composables/useCastMembers.ts`
    - `apps/frontend/app/layouts/dashboard.vue`
    - New files: `apps/frontend/app/pages/stars.vue`, `apps/frontend/app/components/CastMemberCard.vue`
