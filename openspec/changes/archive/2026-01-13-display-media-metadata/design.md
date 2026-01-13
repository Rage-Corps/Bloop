# Design: Display Media Metadata

## Architecture Overview
The frontend already receives `MediaWithMetadata` objects which include the `duration` and `cast` fields. We only need to modify the Vue components to render these properties.

## UI Components

### MediaCard.vue
- **Duration Overlay**: Add a small, semi-transparent overlay on the bottom right of the thumbnail to show the duration (e.g., "45:30"). This follows common patterns for media browsers (like YouTube or Plex).

### MediaDrawer.vue
- **Metadata Section**: Add a new section or update the existing one to show:
    - **Duration**: Displayed prominently near the title or in the "Additional Info" section.
    - **Cast**: Displayed as a list of chips/badges or a comma-separated list.
    - **Description**: Ensure the description text is properly spaced and readable.

## Data Mapping
- `item.duration`: Rendered as text.
- `item.cast`: Rendered as a list of tags.
- `item.description`: Rendered as paragraph text.

## Trade-offs
- **Card Complexity**: Adding duration to the card makes it slightly more busy, but provides high value for user selection.
- **Drawer Layout**: We'll use badges for cast members to maintain consistency with categories.
