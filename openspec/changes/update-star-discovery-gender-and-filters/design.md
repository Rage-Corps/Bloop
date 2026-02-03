# Design: Star Discovery Gender and Filtering

This design details how performer gender information is captured, stored, and utilized for filtering in the Bloop application.

## Overview

The `pornhub.js` library provides gender information for performers on their model/pornstar pages. We will leverage this during the star image discovery process to also capture and save the performer's gender. This data will then be used to provide better filtering options on the Stars page.

## Components

### 1. Database Schema

We will add a `gender` column (text, nullable) to the `cast_members` table. This is preferred over a separate enum or table for simplicity, as the values from PornHub are strings and may vary (e.g., "female", "male", "transgender").

### 2. Temporal Worker (Scraping)

The `findStarImage` activity (which uses `pornhub.model(name)`) will be updated to return both the `avatar` URL and the `gender` field from the `ModelPage` object.

The `updateStarImage` activity will be updated to `updateStarInfo` to persist both the image URL and the gender to the database.

### 3. Backend API

The `GET /api/cast` endpoint will be updated to support a `gender` query parameter. It will also include the `gender` field in its response.

### 4. Frontend UI

The Stars page (`/stars`) will be updated to include a `Gender` filter.

- **Default Value**: "Female".
- **Interaction**: Selecting a gender will trigger a reload of the stars list with the appropriate filter applied to the backend request.
- **Persistence**: The gender preference will be saved to the user's configuration, similar to the `orderBy` and `hasImage` preferences.

The "With images" toggle will now default to `true` to ensure users see high-quality entries by default.

## Data Flow

1. **Discovery**: `starImageDiscoveryWorkflow` -> `discoverStarInfo` (Activity) -> `pornhub.model(name)` -> Returns `{ imageUrl, gender }`.
2. **Persistence**: `updateStarInfo` (Activity) -> `CastDao.updateStarInfo` -> DB (`cast_members` table).
3. **Consumption**: `stars.vue` -> `useCastMembers` -> `GET /api/cast?gender=female&hasImage=true` -> Backend -> `CastDao.getAllCastMembers` -> Returns filtered list.

## Trade-offs

- **Nullable Gender**: Some performers might not have gender information on PornHub. The system handles this by allowing the `gender` column to be null.
- **Client-side Defaults**: We are setting defaults in the Vue component. While we could set them in the backend API, keeping them in the FE allows for a more flexible UI and easier persistence of user-specific preferences.
