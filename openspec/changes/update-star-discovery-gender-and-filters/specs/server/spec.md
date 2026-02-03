# server Spec Delta

## MODIFIED Requirements

### Requirement: Cast Member Querying

The system SHALL support filtering cast members by gender.

#### Scenario: Filter by gender

- **WHEN** a `GET /api/cast` request includes a `gender` query parameter (e.g., "female")
- **THEN** only cast members with that gender SHALL be returned
- **AND** the response SHALL include the `gender` field for each cast member
