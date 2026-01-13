# Tasks: Update Search and Filtering for Cast Members

## Phase 1: Shared Types & Database
- [ ] 1.1 Update `MediaQuery` in `packages/shared-types/src/index.ts` to include `cast?: string[]`
- [ ] 1.2 Update `MediaDao.getMediaWithPagination` in `packages/database/src/dao/mediaDao.ts` to support `cast` filter
- [ ] 1.3 Update `MediaDao.getMediaWithPagination` in `packages/database/src/dao/mediaDao.ts` to include cast members in `name` search
- [ ] 1.4 Add `getAllCastMembers` to `CastDao` if not already present and expose it via a new endpoint in `apps/backend/src/routes/cast.ts` (or similar)

## Phase 2: Backend API
- [ ] 2.1 Update `GET /media` schema and parsing in `apps/backend/src/routes/media.ts` to support `cast` parameter
- [ ] 2.2 Create `GET /cast` endpoint to fetch all available cast members for the filter dropdown

## Phase 3: Frontend Implementation
- [ ] 3.1 Update `dashboard.vue` to manage `selectedCast` state and handle filtering
- [ ] 3.2 Update `MediaFilters.vue` to include the Cast selection dropdown
- [ ] 3.3 Update `MediaDrawer.vue` to make cast badges clickable and emit filter events
- [ ] 3.4 Add `fetchCastMembers` to a new `useCastMembers` composable (or add to `useMedia`)

## Phase 4: Verification
- [ ] 4.1 Verify searching for a cast member in the search bar returns relevant media
- [ ] 4.2 Verify clicking a cast member in the drawer filters the dashboard
- [ ] 4.3 Verify selecting multiple cast members in the filter bar works (AND logic)
- [ ] 4.4 Run project linting and tests
