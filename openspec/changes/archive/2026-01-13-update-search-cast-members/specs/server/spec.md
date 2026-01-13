# server Spec Delta

## ADDED Requirements

### Requirement: Media Query Support
The system SHALL support querying media by name, categories, sources, and cast members.

#### Scenario: Query by cast member
- **GIVEN** an API request to `GET /media` with `cast=Actor+A`
- **WHEN** the server processes the request
- **THEN** it SHALL return only media items associated with "Actor A"

#### Scenario: Search includes cast members
- **GIVEN** an API request to `GET /media` with `name=John`
- **WHEN** the server processes the request
- **THEN** it SHALL return media where the name contains "John" OR any cast member's name contains "John"

### Requirement: Fetch All Cast Members
The system SHALL provide an endpoint to retrieve all unique cast members.

#### Scenario: Get cast list
- **WHEN** a client sends a `GET /cast` request
- **THEN** the server SHALL return a list of all cast members currently in the database
