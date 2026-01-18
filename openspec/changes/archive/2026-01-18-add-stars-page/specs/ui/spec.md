## ADDED Requirements

### Requirement: Stars Page
The system SHALL provide a dedicated page at `/stars` to browse media by cast member.

#### Scenario: View Stars list
- **GIVEN** an authenticated user
- **WHEN** they navigate to the `/stars` page
- **THEN** they SHALL see a grid of cast members
- **AND** each cast member SHALL be displayed with their name and image

#### Scenario: Filter media by star
- **GIVEN** the stars page
- **WHEN** the user clicks on a cast member card
- **THEN** they SHALL be navigated to the dashboard
- **AND** the dashboard SHALL be filtered to show only media featuring that cast member

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
