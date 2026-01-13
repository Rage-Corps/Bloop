# Proposal: Display Media Metadata

## Summary
Display newly added media metadata (duration, cast, and updated description) in the frontend UI. This includes updates to both the media cards in the dashboard and the detailed media drawer.

## Problem
The system now extracts and stores additional metadata (duration, cast, and raw description) from scraped media pages, but this information is not yet visible to the user in the frontend. Users need this information to better identify and select media items.

## Solution
1. Update `MediaCard.vue` to show duration as a badge/overlay for quick reference.
2. Update `MediaDrawer.vue` to display the full cast list and duration alongside existing details.
3. Improve description display in `MediaDrawer.vue`, ensuring it uses the most descriptive text available.

## Scope
- **Frontend**: Update Vue components to render new metadata fields.
- **Shared Types**: Verified that `MediaWithMetadata` already contains `duration` and `cast`.

## Out of Scope
- Modifying the scraping logic or database schema (already implemented).
- Adding search/filter by cast in the UI (to be handled in a separate change if requested).
