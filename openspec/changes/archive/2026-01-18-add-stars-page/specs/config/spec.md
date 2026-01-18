## ADDED Requirements

### Requirement: Cast Members Database Table
The system SHALL have a `cast_members` table to store performer information.

#### Scenario: Schema Migration for Cast Member Images
- **GIVEN** the database schema
- **WHEN** the migration is applied
- **THEN** the `cast_members` table SHALL include an `image_url` column of type `text` (nullable)
