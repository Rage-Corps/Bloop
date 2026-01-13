# scraping Specification

## Purpose
TBD - created by archiving change add-rotating-proxy. Update Purpose after archive.
## Requirements
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

### Requirement: Media Metadata Storage

The system SHALL store additional metadata extracted from scraped media pages including duration, cast members, and raw description HTML.

#### Scenario: Store duration from scraped page

- **WHEN** a media page is scraped
- **AND** the page contains duration information (e.g., "Duration: 45:30")
- **THEN** the duration string SHALL be stored in the media record

#### Scenario: Store cast members with many-to-many relationship

- **WHEN** a media page is scraped
- **AND** the page contains cast information (e.g., "Cast: Alice, Bob, Charlie")
- **THEN** each cast member name SHALL be stored in the cast_members table (deduplicated by exact name)
- **AND** the media record SHALL be linked to each cast member via the media_cast junction table

#### Scenario: Store raw description HTML

- **WHEN** a media page is scraped
- **THEN** the raw HTML of the description div SHALL be stored in the media record's rawDescriptionDiv field

#### Scenario: Cast member deduplication

- **GIVEN** a cast member "Alice" already exists in the cast_members table
- **WHEN** another media page is scraped with "Alice" in the cast
- **THEN** the existing cast_members record SHALL be reused
- **AND** a new media_cast relationship SHALL be created linking the new media to the existing cast member

### Requirement: Cast Member Querying

The system SHALL support querying media by cast member.

#### Scenario: Find media by cast member name

- **WHEN** an API query includes a cast member filter
- **THEN** only media items linked to that cast member SHALL be returned

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

