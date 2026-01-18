# Proposal: Add Watchlist Feature

## Problem
Users currently have no way to save media items for later viewing. This makes it difficult to keep track of interesting content found while browsing.

## Proposed Solution
Implement a "Watchlist" feature that allows users to:
1.  Add and remove media items from their personal watchlist.
2.  View their watchlist on a dedicated page.
3.  Quickly toggle watchlist status from media cards and the detail drawer.
4.  Access the watchlist page via a link in the header.

## Impact
- **UI**: New "Watchlist" page, updated `MediaCard` and `MediaDrawer` with toggle buttons, updated header navigation.
- **Backend**: New `watchlist` database table, new API endpoints for managing watchlist items.
- **Shared**: New types for watchlist items.

## Change ID
`add-watchlist`
