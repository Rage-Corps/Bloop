# server Spec Delta

## MODIFIED Requirements

### Requirement: Fetch All Cast Members

The system SHALL provide an endpoint to retrieve all unique cast members and support filtering by gender.

#### Scenario: Get cast list with metadata
- **WHEN** a client sends a `GET /cast` request
- **THEN** server SHALL return an array of objects
- **AND** each object SHALL contain `id`, `name`, `imageUrl` fields
- **AND** each object SHALL contain `mediaCount` field
- **AND** each object SHALL contain `gender` field

#### Scenario: Get cast list with sorting and filtering
- **GIVEN** a `GET /cast` request with `orderBy=mediaCount_desc` and `hasImage=true`
- **WHEN** server processes the request
- **THEN** response SHALL include only cast members with images
- **AND** results SHALL be sorted by media count in descending order

#### Scenario: Filter by gender
- **WHEN** a `GET /api/cast` request includes a `gender` query parameter (e.g., "female")
- **THEN** only cast members with that gender SHALL be returned
- **AND** the response SHALL include the `gender` field for each cast member
