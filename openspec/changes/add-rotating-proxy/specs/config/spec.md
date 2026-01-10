## ADDED Requirements

### Requirement: Proxy Configuration

The application SHALL support configuration for an external HTTP proxy to be used for scraping requests.

#### Scenario: Proxy URL Configuration

- Given the application environment variables
- When `PROXY_URL` is defined (e.g., `http://tor-proxy:3128`)
- Then the scraping service should use this proxy for outbound requests
