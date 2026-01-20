# ui Specification Delta

## MODIFIED Requirements

### Requirement: Header User Menu
The navigation header SHALL include a dropdown menu triggered by the user avatar.

#### Scenario: Access Settings from Header
- **GIVEN** any page with the navigation header
- **WHEN** the user clicks on the user avatar/dropdown
- **THEN** they SHALL see an option for "Settings"
- **AND** clicking it SHALL navigate them to the `/settings` page

### Requirement: Stars Page
The system SHALL provide a dedicated page at `/stars` to browse media by cast member.

#### Scenario: No Discover Images button
- **GIVEN** the stars page
- **WHEN** the page is rendered
- **THEN** it SHALL NOT contain a "Discover Images" button

## ADDED Requirements

### Requirement: Settings Page
The system SHALL provide a dedicated page at `/settings` for administrative tasks and configuration.

#### Scenario: Trigger Full Scrape
- **GIVEN** the settings page
- **WHEN** the user clicks the "Full Scrape" button
- **THEN** the system SHALL trigger the `scrapingWorkflow`
- **AND** a confirmation toast SHALL be displayed

#### Scenario: Trigger Star Image Discovery
- **GIVEN** the settings page
- **WHEN** the user clicks the "Discover Images" button
- **THEN** the system SHALL trigger the `starImageDiscoveryWorkflow`
- **AND** a confirmation toast SHALL be displayed
