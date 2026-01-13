# Proposal: Update Search and Filtering for Cast Members

## Problem
Currently, users can see cast members in the media drawer, but they cannot search for media by cast member or filter the dashboard by clicking on a cast member. This limits the discoverability of media based on actors/performers.

## Proposed Solution
Update the backend search logic to include cast members in general searches and add a specific cast filter. On the frontend, allow users to click on cast member badges in the media drawer to filter the dashboard to that specific cast member. Additionally, add a cast filter to the dashboard filter bar.

## Scope
- **Shared Types**: Update `MediaQuery` to include an optional `cast` filter.
- **Backend (Database)**: Update `MediaDao.getMediaWithPagination` to support the `cast` filter and include cast members in the name-based search.
- **Backend (API)**: Update the `/media` endpoint to accept and parse the `cast` query parameter.
- **Frontend (UI)**: 
    - Update `MediaDrawer.vue` to allow clicking cast badges.
    - Update `dashboard.vue` to handle the cast filter.
    - Update `MediaFilters.vue` to include a cast filter selection.

## Risks & Mitigations
- **Performance**: Joining with cast members might slow down queries. We can mitigate this by ensuring proper indexing on the `cast_members` and `media_cast` tables.
- **Complexity**: Managing multiple filters can be tricky. We'll ensure the existing "AND" logic for filters is maintained.
