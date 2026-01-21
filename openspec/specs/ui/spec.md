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

### Requirement: Watchlist Toggle in MediaCard
The `MediaCard` component SHALL include a button to toggle the watchlist status of a media item.

#### Scenario: Toggle from Card
- **GIVEN** a media card on the dashboard
- **WHEN** the user clicks the heart/bookmark icon on the card
- **THEN** the media SHALL be added to or removed from their watchlist
- **AND** the icon state SHALL update visually to reflect the new status

### Requirement: Watchlist Toggle in MediaDrawer
The `MediaDrawer` component SHALL include a button to toggle the watchlist status.

#### Scenario: Toggle from Drawer
- **GIVEN** the media detail drawer is open
- **WHEN** the user clicks the "Watchlist" button
- **THEN** the media SHALL be added to or removed from their watchlist
- **AND** the button text/icon SHALL update to reflect the new status

### Requirement: Watchlist Page
The system SHALL provide a dedicated page at `/watchlist` to view all watchlisted media.

#### Scenario: View Watchlist
- **GIVEN** a user with items in their watchlist
- **WHEN** they navigate to the watchlist page
- **THEN** they SHALL see a grid of all their watchlisted media items

### Requirement: Header Link to Watchlist
The navigation header SHALL include a link to the Watchlist page.

#### Scenario: Access Watchlist from Header
- **GIVEN** any page with the navigation header
- **WHEN** the user clicks the "Watchlist" link
- **THEN** they SHALL be navigated to the `/watchlist` page

### Requirement: Stars Page
The system SHALL provide a dedicated page at `/stars` to browse media by cast member.

#### Scenario: No Discover Images button
- **GIVEN** the stars page
- **WHEN** the page is rendered
- **THEN** it SHALL NOT contain a "Discover Images" button

### Requirement: Header Link to Stars Page
The navigation header SHALL include a link to the Stars page.

#### Scenario: Access Stars from Header
- **GIVEN** any page with the navigation header
- **WHEN** the user clicks the "Stars" link
- **THEN** they SHALL be navigated to the `/stars` page

### Requirement: Cast Member Card Component
The system SHALL include a `CastMemberCard` component to display individual performer information.

#### Scenario: Rendering CastMemberCard
- **GIVEN** a cast member with a name and image
- **WHEN** the `CastMemberCard` is rendered
- **THEN** it SHALL display the performer's image
- **AND** it SHALL display the performer's name

### Requirement: Header User Menu
The navigation header SHALL include a dropdown menu triggered by the user avatar.

#### Scenario: Access Settings from Header
- **GIVEN** any page with the navigation header
- **WHEN** the user clicks on the user avatar/dropdown
- **THEN** they SHALL see an option for "Settings"
- **AND** clicking it SHALL navigate them to the `/settings` page

### Requirement: Settings Page
The system SHALL provide a dedicated page at `/settings` for administrative tasks and configuration.

#### ADDED Scenario: Trigger Media Cleanup
- **GIVEN** the settings page
- **WHEN** the user clicks the "Cleanup Media Sources" button
- **THEN** the system SHALL trigger the `mediaCleanupWorkflow`
- **AND** a confirmation toast SHALL be displayed

