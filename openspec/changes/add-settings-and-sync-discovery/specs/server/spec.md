# server Specification Delta

## MODIFIED Requirements

### Requirement: Cast Image Discovery
The system SHALL support finding and updating images for cast members.

#### Scenario: Background image fetching with overwrite
- **GIVEN** a cast member in the database
- **WHEN** a discovery task is triggered (e.g., via `starImageDiscoveryWorkflow`)
- **THEN** the system SHALL attempt to find a relevant image (e.g., via search or industry databases)
- **AND** update the cast member's `imageUrl` in the database, overwriting any previous value

## ADDED Requirements

### Requirement: Star Image Discovery API
The backend SHALL provide an endpoint to trigger the star image discovery workflow.

#### Scenario: Trigger discovery workflow
- **WHEN** a `POST /api/cast/discover-images` request is received
- **THEN** the system SHALL start a `starImageDiscoveryWorkflow` in Temporal
- **AND** return a 201 status with the `workflowId`
