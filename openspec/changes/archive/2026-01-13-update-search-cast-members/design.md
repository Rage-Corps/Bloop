# Design: Cast Member Search and Filtering

## Architecture Overview
The change spans the entire stack, from the database query logic to the frontend UI components.

### 1. Database Layer (Packages/Database)
- **`MediaDao.getMediaWithPagination`**:
    - Add a `cast` filter to the query builder.
    - If `cast` names are provided, join `media` with `mediaCast` and `castMembers`.
    - Use "AND" logic for multiple cast members (media must have ALL specified cast members) to stay consistent with categories and sources.
    - Update the `name` search to also check if the search term matches any cast member name using an OR condition with the media name.
- **`CastDao`**: Already has methods to fetch cast members which can be used to populate the filter dropdown.

### 2. API Layer (Apps/Backend)
- **`mediaRoutes`**:
    - Update the Fastify schema for the `GET /media` endpoint to include a `cast` query parameter (string, comma-separated).
    - Parse the `cast` parameter into an array of strings before passing it to the DAO.

### 3. Frontend Layer (Apps/Frontend)
- **`dashboard.vue`**:
    - Add `selectedCast` as a reactive reference.
    - Pass `selectedCast` to `MediaFilters`.
    - Update `loadMedia` to include the `cast` filter in the API call.
    - Handle a new `filter-cast` event from `MediaDrawer` (or just use a global state/event bus if preferred, but passing a prop/event is cleaner). Actually, since `dashboard.vue` hosts both `MediaFilters` and `MediaDrawer`, it can just handle an event from `MediaDrawer`.
- **`MediaDrawer.vue`**:
    - Add a click handler to the `UBadge` elements in the cast section.
    - Emit a `filter-cast` event with the actor's name.
- **`MediaFilters.vue`**:
    - Add a `USelect` for cast members, similar to categories and sources.
    - Fetch available cast members from the backend (will need a new endpoint or use existing `CastDao` through a new route).

## Data Flow
1. User clicks an actor badge in `MediaDrawer`.
2. `MediaDrawer` emits `filter-cast(actorName)`.
3. `dashboard.vue` receives the event, updates `selectedCast`, and calls `loadMedia()`.
4. `loadMedia()` calls the backend API with `?cast=actorName`.
5. Backend parses the query and calls `MediaDao.getMediaWithPagination({ cast: ['actorName'] })`.
6. DAO executes the SQL with appropriate joins and filters.
7. Results are returned to the frontend and displayed.

## UI/UX
- Cast badges in `MediaDrawer` will have a hover effect indicating they are clickable.
- A new "Cast" dropdown will appear in the filter bar on the dashboard.
- Clicking an actor in the drawer will automatically populate the "Cast" dropdown and refresh the grid.
