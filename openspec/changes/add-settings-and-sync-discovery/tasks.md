# Tasks: Settings Page and Enhanced Image Discovery

## Phase 1: Database & Backend (Activities/DAO)
- [x] Update `CastDao` to support `imageUrl` during upsert, provide `getAllCastMembers`, and `getByName`.
- [x] Update `MediaDao` to accept objects with `imageUrl` in the `cast` input for `upsertMedia` and `createMedia`.
- [x] Update `db` activities in `temporal-worker` to support the updated DAO methods (including `getCastByName`).
- [x] Update `stars` activities in `temporal-worker` to include `getAllCastMembers`.

## Phase 2: Workflows
- [x] Modify `mediaScrapeWorkflow` to check for existing images and only call `findStarImage` if missing.
- [x] Modify `starImageDiscoveryWorkflow` to process all cast members and overwrite existing images with fresh discoveries.

## Phase 3: Frontend (Layout & Components)
- [x] Update `dashboard.vue` layout to implement the user avatar dropdown with "Settings" and "Sign out".
- [x] Create `/settings` page with "Full Scrape" and "Discover Images" buttons.
- [x] Remove "Discover Images" button from `/stars` page.
- [x] Ensure `useCastMembers` or a new composable supports triggering the discovery and scrape workflows.

## Phase 4: Validation
- [x] Verify `mediaScrapeWorkflow` fetches and stores cast images.
- [x] Verify `starImageDiscoveryWorkflow` updates all cast members.
- [x] Verify UI navigation and triggers.
