# server Specification Delta

## ADDED Requirements

### Requirement: Media Cleanup API
The backend SHALL provide an endpoint to trigger the media source cleanup workflow.

#### Scenario: Trigger cleanup workflow
- **WHEN** a `POST /api/media/cleanup` request is received
- **THEN** the system SHALL start a `mediaCleanupWorkflow` in Temporal
- **AND** return a 201 status with the `workflowId`

### Requirement: Media Source Validation Logic
The cleanup workflow SHALL identify broken media sources based on HTTP status and content.

#### Scenario: Identify broken source by HTTP status
- **GIVEN** a media source URL
- **WHEN** the validation activity receives a 404 or 503 status code
- **THEN** the source SHALL be marked as broken

#### Scenario: Identify broken source by content
- **GIVEN** a media source URL returning a 200 status
- **WHEN** the response body contains the string "video not found"
- **THEN** the source SHALL be marked as broken

### Requirement: Cascading Media Deletion
The system SHALL maintain data integrity by removing Media records that have no remaining sources.

#### Scenario: Delete orphaned media
- **GIVEN** a Media record where its last MediaSource has been deleted
- **WHEN** the cleanup process identifies the orphaned Media
- **THEN** the system SHALL delete the Media record
- **AND** remove all associated Cast, Category, and Watchlist relations
