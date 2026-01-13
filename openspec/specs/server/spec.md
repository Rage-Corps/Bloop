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

