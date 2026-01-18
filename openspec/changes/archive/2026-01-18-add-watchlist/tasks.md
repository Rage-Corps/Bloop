# Tasks: Add Watchlist Feature

- [x] **Infrastructure & Backend**
    - [x] Add `watchlist` table to `packages/database/src/schema.ts`
    - [x] Create `packages/database/src/dao/watchlistDao.ts`
    - [x] Export `WatchlistDao` from `packages/database/src/index.ts`
    - [x] Add watchlist types to `packages/shared-types/src/index.ts`
    - [x] Create `apps/backend/src/routes/watchlist.ts` with GET, POST, DELETE endpoints
    - [x] Register watchlist routes in `apps/backend/src/server.ts`
    - [x] Run database migrations (or `drizzle-kit push`) to update schema

- [x] **Frontend Core**
    - [x] Create `apps/frontend/app/composables/useWatchlist.ts` for state management
    - [x] Implement fetch, add, and remove logic in `useWatchlist.ts`

- [x] **Frontend UI Components**
    - [x] Update `apps/frontend/app/components/MediaCard.vue` to add watchlist toggle
    - [x] Update `apps/frontend/app/components/MediaDrawer.vue` to add watchlist toggle
    - [x] Update `apps/frontend/app/layouts/dashboard.vue` to add "Watchlist" link in header

- [x] **Frontend Pages**
    - [x] Create `apps/frontend/app/pages/watchlist.vue` to display watchlisted items
    - [x] Ensure watchlist page uses `MediaCard` for display

- [x] **Verification**
    - [x] Verify adding an item from dashboard updates its status
    - [x] Verify removing an item from dashboard updates its status
    - [x] Verify adding/removing from detail drawer works correctly
    - [x] Verify watchlist page correctly displays all saved items
    - [x] Verify watchlist page is accessible from the header link
