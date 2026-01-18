# Design: Watchlist Feature

## Architecture Overview
The watchlist feature will follow the existing project architecture, utilizing a PostgreSQL database for persistence, a Fastify-based backend for API endpoints, and a Nuxt.js frontend for the user interface.

## Data Model
A new `watchlist` table will be added to the database to store the relationship between users and media items.

```typescript
export const watchlist = pgTable('watchlist', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  mediaId: text('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow()
})
```

## API Design
New endpoints will be added to manage the watchlist:
- `GET /api/watchlist`: Returns the list of media items in the authenticated user's watchlist.
- `POST /api/watchlist`: Adds a media item to the user's watchlist. Requires `mediaId` in the body.
- `DELETE /api/watchlist/:mediaId`: Removes a media item from the user's watchlist.

## Frontend Implementation
- **Composable**: `useWatchlist.ts` will manage the state of the user's watchlist, providing methods to add/remove items and check if an item is already watchlisted.
- **Navigation**: A link to `/watchlist` will be added to the header in `dashboard.vue`.
- **MediaCard**: A heart or bookmark icon will be added as an overlay on the thumbnail to toggle watchlist status.
- **MediaDrawer**: A watchlist toggle button will be added near the media title.
- **Watchlist Page**: A new page `/watchlist` that displays the user's watchlisted media items using the existing `MediaCard` component.

## Security
All watchlist operations require authentication. The `authenticateUser` middleware will be used to ensure only logged-in users can manage their watchlists.
