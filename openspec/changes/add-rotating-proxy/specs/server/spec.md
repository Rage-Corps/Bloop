## ADDED Requirements

### Requirement: Rotating Proxy Service

The development environment SHALL include a rotating proxy service to facilitate IP rotation for web scraping.

#### Scenario: Proxy Service Availability

- Given the `docker-compose.dev.yml` configuration
- When the stack is started
- Then a `tor-proxy` service should be running
- And it should be accessible to other services on port `3128` (or configured port)
