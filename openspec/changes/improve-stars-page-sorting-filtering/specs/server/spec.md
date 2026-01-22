## ADDED Requirements

### Requirement: Cast Sorting
The `/api/cast` endpoint SHALL support sorting cast members by name or media count.

#### Scenario: Sort by name ascending
- **GIVEN** a `GET /api/cast` request
- **WHEN** request includes `orderBy=name_asc` parameter
- **THEN** response SHALL be sorted by cast member name in ascending order

#### Scenario: Sort by name descending
- **GIVEN** a `GET /api/cast` request
- **WHEN** request includes `orderBy=name_desc` parameter
- **THEN** response SHALL be sorted by cast member name in descending order

#### Scenario: Sort by media count ascending
- **GIVEN** a `GET /api/cast` request
- **WHEN** request includes `orderBy=mediaCount_asc` parameter
- **THEN** response SHALL be sorted by number of associated media items in ascending order

#### Scenario: Sort by media count descending
- **GIVEN** a `GET /api/cast` request
- **WHEN** request includes `orderBy=mediaCount_desc` parameter
- **THEN** response SHALL be sorted by number of associated media items in descending order

### Requirement: Cast Image Filter
The `/api/cast` endpoint SHALL support filtering cast members by image status.

#### Scenario: Filter stars with images only
- **GIVEN** a `GET /api/cast` request
- **WHEN** request includes `hasImage=true` parameter
- **THEN** response SHALL include only cast members where `imageUrl` is not null

#### Scenario: Include all stars regardless of images
- **GIVEN** a `GET /api/cast` request
- **WHEN** request does NOT include `hasImage` parameter or `hasImage=false`
- **THEN** response SHALL include all cast members

### Requirement: Cast Media Count
The `/api/cast` endpoint SHALL return the count of media items each cast member is associated with.

#### Scenario: Response includes media count
- **GIVEN** a `GET /api/cast` request
- **WHEN** server processes the request
- **THEN** each cast member object SHALL include a `mediaCount` field representing the number of media associations

#### Scenario: Zero media count
- **GIVEN** a cast member with no media associations
- **WHEN** returned in `/api/cast` response
- **THEN** the `mediaCount` field SHALL be 0

## MODIFIED Requirements

### Requirement: Fetch All Cast Members
The system SHALL provide an endpoint to retrieve all unique cast members.

#### Scenario: Get cast list with metadata
- **WHEN** a client sends a `GET /cast` request
- **THEN** server SHALL return an array of objects
- **AND** each object SHALL contain `id`, `name`, `imageUrl` fields
- **AND** each object SHALL contain `mediaCount` field

#### Scenario: Get cast list with sorting and filtering
- **GIVEN** a `GET /cast` request with `orderBy=mediaCount_desc` and `hasImage=true`
- **WHEN** server processes the request
- **THEN** response SHALL include only cast members with images
- **AND** results SHALL be sorted by media count in descending order
