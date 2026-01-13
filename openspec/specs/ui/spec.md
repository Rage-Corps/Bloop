# ui Specification

## Purpose
TBD - created by archiving change display-media-metadata. Update Purpose after archive.
## Requirements
### Requirement: Display Duration on Media Cards
The system SHALL display the media duration on the thumbnail of the `MediaCard` component when available.

#### Scenario: Media with duration
- **GIVEN** a media item with a `duration` field (e.g., "01:20:30")
- **WHEN** the `MediaCard` is rendered
- **THEN** the duration SHALL be visible as an overlay on the thumbnail image

### Requirement: Display Full Metadata in Media Drawer
The system SHALL display the duration and cast members in the `MediaDrawer` component.

#### Scenario: View media details
- **GIVEN** a media item with `duration` and `cast` (e.g., ["Actor A", "Actor B"])
- **WHEN** the user opens the `MediaDrawer` for that item
- **THEN** the duration SHALL be displayed in the metadata section
- **AND** all cast members SHALL be displayed as distinct tags/badges

### Requirement: Improved Description Rendering
The system SHALL ensure the media description is clearly presented in the `MediaDrawer`.

#### Scenario: Long description
- **GIVEN** a media item with a multi-paragraph description
- **WHEN** the `MediaDrawer` is rendered
- **THEN** the description SHALL be displayed with proper line breaks and legibility

