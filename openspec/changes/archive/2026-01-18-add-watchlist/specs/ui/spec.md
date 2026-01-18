# ui Specification Delta (add-watchlist)

## ADDED Requirements

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
