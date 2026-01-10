# config Specification

## Purpose
TBD - created by archiving change self-host-temporal. Update Purpose after archive.
## Requirements
### Requirement: Default Temporal Address

The backend and temporal-worker services SHALL default to connecting to the internal Temporal server.

#### Scenario: Service connection

- Given the `backend` or `temporal-worker` service
- When it starts without an explicit `TEMPORAL_ADDRESS` environment variable
- Then it should default to `temporal:7233`

### Requirement: Port Mapping

The Temporal UI SHALL be accessible from the host machine for monitoring workflows.

#### Scenario: External access to Temporal UI

- Given the `temporal-ui` service
- When it starts
- Then it should map internal port `8080` to host port `8080`

### Requirement: Proxy Configuration

The application SHALL support configuration for an external HTTP proxy to be used for scraping requests.

#### Scenario: Proxy URL Configuration

- Given the application environment variables
- When `PROXY_URL` is defined (e.g., `http://tor-proxy:3128`)
- Then the scraping service should use this proxy for outbound requests

