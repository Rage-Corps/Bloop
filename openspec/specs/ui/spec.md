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
The system SHALL display the duration and cast members in the `MediaDrawer` component. Cast members SHALL be interactive.

#### Scenario: Filter by cast member from drawer
- **GIVEN** a media item with cast (e.g., ["Actor A", "Actor B"])
- **WHEN** the user clicks on the "Actor A" badge in the `MediaDrawer`
- **THEN** the `MediaDrawer` SHALL close (optional, but usually expected)
- **AND** the dashboard SHALL be filtered to show only media items featuring "Actor A"

### Requirement: Improved Description Rendering
The system SHALL ensure the media description is clearly presented in the `MediaDrawer`.

#### Scenario: Long description
- **GIVEN** a media item with a multi-paragraph description
- **WHEN** the `MediaDrawer` is rendered
- **THEN** the description SHALL be displayed with proper line breaks and legibility

### Requirement: Dashboard Filtering
The system SHALL provide filters for categories, sources, and cast members.

#### Scenario: Filter by multiple cast members
- **GIVEN** the dashboard media library
- **WHEN** the user selects "Actor A" and "Actor B" from the Cast filter dropdown
- **THEN** only media items featuring BOTH "Actor A" AND "Actor B" SHALL be displayed

### Requirement: Search by Cast Member
The system SHALL include cast member names in the general search results.

#### Scenario: Search for actor name
- **GIVEN** a media item named "Great Movie" with cast "John Doe"
- **WHEN** the user searches for "John Doe" in the search bar
- **THEN** "Great Movie" SHALL be included in the search results

