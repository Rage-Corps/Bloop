## MODIFIED Requirements

### Requirement: Fetch All Cast Members
The system SHALL provide an endpoint to retrieve all unique cast members.

#### Scenario: Get cast list with metadata
- **WHEN** a client sends a `GET /cast` request
- **THEN** the server SHALL return an array of objects
- **AND** each object SHALL contain `id`, `name`, and `imageUrl` fields

## ADDED Requirements

### Requirement: Cast Image Discovery
The system SHALL support finding and updating images for cast members.

#### Scenario: Background image fetching
- **GIVEN** a cast member without an `imageUrl`
- **WHEN** a discovery task is triggered
- **THEN** the system SHALL attempt to find a relevant image (e.g., via search or industry databases)
- **AND** update the cast member's `imageUrl` in the database
