## ADDED Requirements

### Requirement: Proxy Support for Scraping

The scraping utilities in both backend and worker services SHALL enable routing traffic through a configured HTTP proxy.

#### Scenario: Scraping via Proxy

- Given a scraping job
- And a configured `PROXY_URL`
- When the system fetches a page
- Then the request should be routed through the proxy
- And the request should succeed despite potential rate limits on the target origin (assuming the proxy works)

#### Scenario: Proxy Timeout Handling

- Given a slow proxy connection
- When a scraping request is made
- Then the timeout configuration should be sufficient (e.g., increased from default) to handle Tor latency
