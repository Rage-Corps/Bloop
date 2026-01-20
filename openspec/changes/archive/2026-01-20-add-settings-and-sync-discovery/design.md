# Design: Settings Page and Enhanced Image Discovery

## Architecture

### 1. Settings Page Implementation
*   **Route**: `/settings` in the frontend Nuxt app.
*   **Layout Integration**: Update `apps/frontend/app/layouts/dashboard.vue` to use `UDropdown` for the user avatar. The dropdown will contain:
    *   User info (disabled header)
    *   Link to `/settings`
    *   Sign out button
*   **Settings View**: A simple page with two cards/sections:
    *   **Full Scrape**: A button to trigger the `scrapingWorkflow`.
    *   **Star Image Discovery**: A button to trigger the `starImageDiscoveryWorkflow`.

### 2. Scraping Workflow Enhancements
*   **Workflow**: `apps/temporal-worker/src/workflows/mediaScrapeWorkflow.ts`
*   **Logic**:
    1.  Extract cast names from `processLink`.
    2.  For each cast name, check if the cast member exists and has an `imageUrl` (using a new `getCastMemberByName` activity).
    3.  If they don't exist or don't have an image, call `findStarImage` (activity).
    4.  Pass a list of objects `{ name: string, imageUrl: string | null }` to `saveMedia`.
*   **Activities/DAO**:
    *   Update `CreateMediaInput` and `UpdateMediaInput` in `MediaDao` to accept `cast: Array<{ name: string, imageUrl?: string | null }>`.
    *   Update `CastDao.findOrCreateByName` to accept an optional `imageUrl` and update it if provided.
    *   Add `CastDao.getByName` to support checking for existing images.

### 3. Star Image Discovery Overhaul
*   **Workflow**: `apps/temporal-worker/src/workflows/starImageDiscoveryWorkflow.ts`
*   **Logic**:
    1.  Call `getAllCastMembers` (new or updated activity) instead of `getCastWithoutImages`.
    2.  Iterate through all members and call `findStarImage`.
    3.  Update the image URL in the DB even if it was already set (overwrite).

## Database Schema Changes
No schema changes required, as `imageUrl` already exists on `castMembers`.

## UI/UX Design
*   Follow the existing Tailwind/NuxtUI patterns.
*   The Settings page should look consistent with the Dashboard and Stars pages.
*   Use `toast` notifications to confirm when workflows are started.
