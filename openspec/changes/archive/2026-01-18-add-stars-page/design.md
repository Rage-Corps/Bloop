# Design: Stars Page and Cast Member Images

## Context
The application currently tracks cast members but only stores their names. Users want a visual "Stars" page where they can see performers and find media they appear in. This requires storing and displaying images for these performers.

## Goals
- Provide a dedicated UI for browsing cast members.
- Automatically (or semi-automatically) find images for cast members.
- Maintain performance when listing many performers.

## Decisions

### 1. Schema Update
Add `imageUrl` to `cast_members` table. This allows us to cache the image location once found.

### 2. API Update
The `/api/cast` endpoint will be updated to return `{ name: string, imageUrl: string | null }[]`. This is a breaking change for the frontend, but we'll update the frontend accordingly.

### 3. Image Discovery
We will implement a simple "Image Discovery" mechanism. 
- When the Stars page is loaded, the frontend will request the list of stars.
- If a star is missing an image, the backend *could* trigger a background task to find one.
- For the initial implementation, we'll add a separate endpoint or a flag to trigger image scraping for cast members who lack them.
- We'll use a search-based approach (e.g., scraping search results or a specific performer database) to find images.

### 4. UI Components
- `Stars` Page: A grid layout similar to the dashboard but for cast members.
- `CastMemberCard`: A simple card showing the image and name, clicking it filters the main dashboard by that cast member.

## Risks / Trade-offs
- **Image Quality/Accuracy**: Automated image search might return incorrect images. We should eventually allow manual overrides.
- **Privacy/Legal**: As these are adult actors, we must ensure we comply with any relevant terms of service if we scrape specific sites.
- **Performance**: Listing hundreds of cast members with images can be heavy. We'll implement pagination or lazy loading if needed, though the dashboard already uses pagination.

## Migration Plan
1. Apply schema change to add `imageUrl`.
2. Update backend route and frontend composable.
3. Create new UI components and page.
4. Implement a background task/activity to populate missing images.
