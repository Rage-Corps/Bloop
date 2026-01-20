# scraping Specification Delta

## MODIFIED Requirements

### Requirement: Full Data Parity in Worker
The Temporal worker SHALL achieve full parity with the backend's extraction logic, ensuring all metadata is persisted correctly.

#### Scenario: Comprehensive Metadata Persistence with Cast Images
- **WHEN** a media page is scraped by the Temporal worker
- **THEN** it SHALL extract and persist: `name`, `description`, `thumbnailUrl`, `sources`, `categories`, `dateAdded`, `duration`, `cast`, and `rawDescriptionDiv`.
- **AND** it SHALL attempt to find and store an image for each cast member (that does not already have one in the database) using the `findStarImage` utility.

### Requirement: Cast Member Image Extraction
The system SHALL support extracting or finding images for cast members.

#### Scenario: Sync Discovery for all cast members
- **GIVEN** the star image discovery workflow is triggered
- **WHEN** the workflow executes
- **THEN** it SHALL iterate through ALL cast members in the database (regardless of whether they already have an image)
- **AND** it SHALL attempt to find a fresh image URL for each member
- **AND** it SHALL overwrite the existing image URL with the new discovery result
