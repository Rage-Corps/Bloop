## MODIFIED Requirements
### Requirement: Media Query Support
The system SHALL support querying media by name, categories, sources, and cast members.

#### Scenario: Query by cast member
- **GIVEN** an API request to `GET /api/media` with `cast=Actor+A`
- **WHEN** the server processes the request
- **THEN** it SHALL return only media items associated with "Actor A"

#### Scenario: Search includes cast members
- **GIVEN** an API request to `GET /api/media` with `name=John`
- **WHEN** the server processes the request
- **THEN** it SHALL return media where the name contains "John" OR any cast member's name contains "John"

## ADDED Requirements
### Requirement: Scraping REST API
The backend SHALL provide a clean, documented REST API for managing scraping workflows using Temporal.

#### Scenario: Trigger scraping workflow
- **WHEN** a `POST /api/scraping/trigger` request is received
- **THEN** the system SHALL start a `scrapingWorkflow` in Temporal
- **AND** return a 201 status with the `workflowId`

#### Scenario: List scraping workflows
- **WHEN** a `GET /api/scraping/status` request is received
- **THEN** the system SHALL return a list of active and recent scraping workflows from Temporal

#### Scenario: Terminate a scraping workflow
- **WHEN** a `POST /api/scraping/terminate/:workflowId` request is received
- **THEN** the system SHALL terminate the specified Temporal workflow and its children

#### Scenario: Terminate all scraping workflows
- **WHEN** a `POST /api/scraping/terminate-all` request is received
- **THEN** the system SHALL terminate all running scraping workflows in Temporal

### Requirement: Scraping Schedule Management
The system SHALL support configuring and managing recurring scraping tasks via Temporal Schedules.

#### Scenario: Update scraping schedule
- **WHEN** a client updates the scraping frequency in settings
- **THEN** the system SHALL update the corresponding Temporal Schedule
- **AND** the change SHALL be reflected in subsequent executions
