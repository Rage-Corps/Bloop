# server Specification

## Purpose
TBD - created by archiving change self-host-temporal. Update Purpose after archive.
## Requirements
### Requirement: Temporal Service in Docker Compose

The system SHALL include a Temporal server and UI service in the Docker Compose configuration to enable local development without external dependencies.

#### Scenario: Developer starts the stack

- Given a `docker-compose.dev.yml` file
- When the developer runs `docker compose up`
- Then a `temporal` service should start using the `temporalio/auto-setup` image
- And a `temporal-ui` service should start using the `temporalio/ui` image

### Requirement: Persistence Configuration

The Temporal server SHALL use the existing PostgreSQL database for persistence.

#### Scenario: Temporal server persistence

- Given the `temporal` service
- When it starts
- Then it should connect to the existing `postgres` service
- And it should use a dedicated database named `temporal`
- And it should handle its own schema migrations on startup

### Requirement: Network Accessibility

The Temporal server SHALL be accessible to other services within the Docker network.

#### Scenario: Service communication

- Given the internal network `dev-network`
- When other services (backend, worker) attempt to connect to the Temporal server
- Then they should be able to reach it via `temporal:7233`

### Requirement: Rotating Proxy Service

The development environment SHALL include a rotating proxy service to facilitate IP rotation for web scraping.

#### Scenario: Proxy Service Availability

- Given the `docker-compose.dev.yml` configuration
- When the stack is started
- Then a `tor-proxy` service should be running
- And it should be accessible to other services on port `3128` (or configured port)

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

### Requirement: Fetch All Cast Members
The system SHALL provide an endpoint to retrieve all unique cast members.

#### Scenario: Get cast list with metadata
- **WHEN** a client sends a `GET /cast` request
- **THEN** the server SHALL return an array of objects
- **AND** each object SHALL contain `id`, `name`, and `imageUrl` fields

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

### Requirement: Watchlist API Endpoints
The backend SHALL provide endpoints for users to manage their watchlists.

#### Scenario: Get Watchlist
- **GIVEN** an authenticated user
- **WHEN** they request `GET /api/watchlist`
- **THEN** the server SHALL return a list of media items in their watchlist
- **AND** the response SHALL include full media metadata (sources, categories, cast)

#### Scenario: Add to Watchlist
- **GIVEN** an authenticated user and a valid `mediaId`
- **WHEN** they request `POST /api/watchlist` with `{ "mediaId": "some-id" }`
- **THEN** the server SHALL add the media to their watchlist
- **AND** return a 201 status

#### Scenario: Remove from Watchlist
- **GIVEN** an authenticated user and a watchlisted `mediaId`
- **WHEN** they request `DELETE /api/watchlist/:mediaId`
- **THEN** the server SHALL remove the media from their watchlist
- **AND** return a 200 status

### Requirement: Authentication for Watchlist
All watchlist endpoints SHALL require user authentication.

#### Scenario: Unauthorized Access
- **GIVEN** an unauthenticated request
- **WHEN** any watchlist endpoint is accessed
- **THEN** the server SHALL return a 401 Unauthorized status

### Requirement: Cast Image Discovery
The system SHALL support finding and updating images for cast members.

#### Scenario: Background image fetching with overwrite
- **GIVEN** a cast member in the database
- **WHEN** a discovery task is triggered (e.g., via `starImageDiscoveryWorkflow`)
- **THEN** the system SHALL attempt to find a relevant image (e.g., via search or industry databases)
- **AND** update the cast member's `imageUrl` in the database, overwriting any previous value

### Requirement: Star Image Discovery API
The backend SHALL provide an endpoint to trigger the star image discovery workflow.

#### Scenario: Trigger discovery workflow
- **WHEN** a `POST /api/cast/discover-images` request is received
- **THEN** the system SHALL start a `starImageDiscoveryWorkflow` in Temporal
- **AND** return a 201 status with the `workflowId`

