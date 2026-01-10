# Spec: Temporal Server Inclusion

## ADDED Requirements

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
