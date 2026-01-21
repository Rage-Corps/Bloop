# Design: Media Source Cleanup Workflow

## Architecture Overview
The cleanup process is implemented as a Temporal workflow to handle the potentially large number of media sources and the inherent unreliability of external network requests.

### Component Interaction
1. **Frontend (React):** Sends a POST request to the backend.
2. **Backend (Node.js/Express):** Starts the `mediaCleanupWorkflow` using the Temporal Client.
3. **Temporal Worker:** Executes the workflow and its activities.
    - **Activity: `getMediaSources`:** Fetches all sources from the DB.
    - **Activity: `validateMediaSource`:** Performs HTTP GET/HEAD and content inspection.
    - **Activity: `deleteMediaSource`:** Removes a source and triggers cascading cleanup if necessary.

## Data Validation Logic
A source is considered "broken" if:
- HTTP Response Status is `404` or `503`.
- HTTP Response Body contains the string "video not found" (case-insensitive check).

## Database & Cascading Deletions
The deletion logic must be transactional to prevent partial data states.
1. Delete `MediaSource` record.
2. Check if the parent `Media` record has any remaining `MediaSource` records.
3. If zero remaining:
    - Delete `Media` record.
    - Cascading deletes (configured at DB level or handled in Activity):
        - `MediaToCast` (join table) entries.
        - `MediaToCategory` (join table) entries.
        - `Watchlist` entries for this `mediaId`.

## Error Handling & Reliability
- **Temporal Retries:** Activities for network requests (`validateMediaSource`) will have exponential backoff to handle transient network issues.
- **Rate Limiting:** The workflow should process sources in batches or with a slight delay to avoid overwhelming external servers or the local database.
