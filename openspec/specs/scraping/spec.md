# scraping Specification

## Purpose
TBD - created by archiving change add-rotating-proxy. Update Purpose after archive.
## Requirements
### Requirement: Proxy Support for Scraping

The scraping utilities in both backend and worker services SHALL enable routing traffic through a configured HTTP proxy. The scraper SHALL extract and persist all available metadata including duration, cast, and raw description HTML.

#### Scenario: Scraping via Proxy

- Given a scraping job
- And a configured `PROXY_URL`
- When the system fetches a page
- Then the request should be routed through the proxy
- And the request should succeed despite potential rate limits on the target origin (assuming the proxy works)
- And all metadata (duration, cast, rawDescriptionDiv) SHALL be extracted and stored

#### Scenario: Proxy Timeout Handling

- Given a slow proxy connection
- When a scraping request is made
- Then the timeout configuration should be sufficient (e.g., increased from default) to handle Tor latency

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

