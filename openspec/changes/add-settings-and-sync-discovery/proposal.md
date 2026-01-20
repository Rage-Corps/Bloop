# Proposal: Add Settings Page and Sync Star Image Discovery

## Problem
The current application lacks a centralized settings page. Scraping and star image discovery actions are scattered or hard to find. Additionally, star image discovery only runs for cast members without images, and scraping doesn't automatically fetch star images during the initial cast extraction.

## Proposed Solution
1.  **Frontend**:
    *   Implement a new Settings page (`/settings`).
    *   Update the dashboard layout to include a user menu dropdown (triggered by clicking the avatar) with a link to Settings and a Sign out option.
    *   On the Settings page, provide buttons to:
        *   Start a full scrape (triggering `scrapingWorkflow`).
        *   Start star image discovery (triggering `starImageDiscoveryWorkflow`).
    *   Remove the "Discover Images" button from the Stars page.
2.  **Scraping Logic**:
    *   Update the `mediaScrapeWorkflow` to fetch star images using `findStarImage` for each extracted cast member (if they don't already exist with an image) before saving to the database.
    *   Update `MediaDao` and `CastDao` to support saving image URLs during cast member upsert.
3.  **Star Image Discovery**:
    *   Modify `starImageDiscoveryWorkflow` and the corresponding DB activity to process *all* cast members, overwriting existing images with freshly discovered ones.

## Impact
*   **User Experience**: Centralized control for administrative tasks.
*   **Data Quality**: Improved cast member data with automated image fetching during scraping and ensuring all cast members have images discovered.
*   **Consistency**: Cleaner UI by moving background task triggers to a dedicated settings page.
