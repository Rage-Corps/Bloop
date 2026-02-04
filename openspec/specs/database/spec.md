# database Specification

## Purpose
TBD - created by archiving change update-star-discovery-gender-and-filters. Update Purpose after archive.
## Requirements
### Requirement: Cast Member Storage

The system SHALL store gender information for cast members.

#### Scenario: Add gender column

- **GIVEN** the `cast_members` table
- **WHEN** the schema is updated
- **THEN** it SHALL include a `gender` text column (nullable)

