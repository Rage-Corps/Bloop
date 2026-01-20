# Tasks: Settings Page and Enhanced Image Discovery

## Phase 1: Database & Backend (Activities/DAO)
- [ ] Update `CastDao` to support `imageUrl` during upsert, provide `getAllCastMembers`, and `getByName`.
- [ ] Update `MediaDao` to accept objects with `imageUrl` in the `cast` input for `upsertMedia` and `createMedia`.
- [ ] Update `db` activities in `temporal-worker` to support the updated DAO methods (including `getCastByName`).
- [ ] Update `stars` activities in `temporal-worker` to include `getAllCastMembers`.

## Phase 2: Workflows
- [ ] Modify `mediaScrapeWorkflow` to check for existing images and only call `findStarImage` if missing.
- [ ] Modify `starImageDiscoveryWorkflow` to process all cast members and overwrite existing images with fresh discoveries.

## Phase 3: Frontend (Layout & Components)
- [ ] Update `dashboard.vue` layout to implement the user avatar dropdown with "Settings" and "Sign out".
- [ ] Create `/settings` page with "Full Scrape" and "Discover Images" buttons.
- [ ] Remove "Discover Images" button from `/stars` page.
- [ ] Ensure `useCastMembers` or a new composable supports triggering the discovery and scrape workflows.

## Phase 4: Validation
- [ ] Verify `mediaScrapeWorkflow` fetches and stores cast images.
- [ ] Verify `starImageDiscoveryWorkflow` updates all cast members.
- [ ] Verify UI navigation and triggers.
