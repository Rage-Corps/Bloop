# ui Spec Delta

## MODIFIED Requirements

### Requirement: Display Full Metadata in Media Drawer
The system SHALL display the duration and cast members in the `MediaDrawer` component. Cast members SHALL be interactive.

#### Scenario: Filter by cast member from drawer
- **GIVEN** a media item with cast (e.g., ["Actor A", "Actor B"])
- **WHEN** the user clicks on the "Actor A" badge in the `MediaDrawer`
- **THEN** the `MediaDrawer` SHALL close (optional, but usually expected)
- **AND** the dashboard SHALL be filtered to show only media items featuring "Actor A"

### Requirement: Dashboard Filtering
The system SHALL provide filters for categories, sources, and cast members.

#### Scenario: Filter by multiple cast members
- **GIVEN** the dashboard media library
- **WHEN** the user selects "Actor A" and "Actor B" from the Cast filter dropdown
- **THEN** only media items featuring BOTH "Actor A" AND "Actor B" SHALL be displayed

## ADDED Requirements

### Requirement: Search by Cast Member
The system SHALL include cast member names in the general search results.

#### Scenario: Search for actor name
- **GIVEN** a media item named "Great Movie" with cast "John Doe"
- **WHEN** the user searches for "John Doe" in the search bar
- **THEN** "Great Movie" SHALL be included in the search results
