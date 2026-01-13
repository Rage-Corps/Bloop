## MODIFIED Requirements
### Requirement: Proxy Support for Scraping

The scraping utilities SHALL route traffic through a configured HTTP proxy. The system SHALL handle HTTP 403 (Forbidden) errors by backing off for 30 seconds before retrying, to allow for rotating proxy IP changes.

#### Scenario: Scraping via Proxy with 403 Backoff
- **GIVEN** a scraping job and a configured `PROXY_URL`
- **WHEN** the system fetches a page and receives an HTTP 403 error
- **THEN** the system SHALL wait for 30 seconds
- **AND** retry the request
- **AND** continue processing if the retry succeeds

#### Scenario: Proxy Timeout Handling
- **GIVEN** a slow proxy connection
- **WHEN** a scraping request is made
- **THEN** the timeout configuration SHALL be sufficient (e.g., 60 seconds) to handle proxy latency

## ADDED Requirements
### Requirement: Temporal-Only Scraping Infrastructure
The system SHALL utilize Temporal as the sole infrastructure for scraping orchestration, queuing, and scheduling. All legacy BullMQ and node-cron logic SHALL be removed from the backend.

#### Scenario: Manual Scraping Trigger
- **WHEN** a client triggers a scraping workflow via the REST API
- **THEN** the system SHALL start a Temporal workflow
- **AND** provide a workflow ID for tracking

#### Scenario: Scheduled Scraping
- **WHEN** a scraping schedule is configured in settings
- **THEN** the system SHALL manage a Temporal Schedule to execute scraping at the specified frequency

### Requirement: Full Data Parity in Worker
The Temporal worker SHALL achieve full parity with the backend's extraction logic, ensuring all metadata is persisted correctly.

#### Scenario: Comprehensive Metadata Persistence
- **WHEN** a media page is scraped by the Temporal worker
- **THEN** it SHALL extract and persist: `name`, `description`, `thumbnailUrl`, `sources`, `categories`, `dateAdded`, `duration`, `cast`, and `rawDescriptionDiv`.
