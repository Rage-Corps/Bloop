# scraping Spec Delta

## MODIFIED Requirements

### Requirement: Full Data Parity in Worker

The Temporal worker SHALL achieve full parity with the extraction logic, ensuring all metadata is persisted correctly.

#### Scenario: Comprehensive Metadata Persistence with Cast Images and Gender

- **WHEN** a media page is scraped by the Temporal worker
- **THEN** it SHALL extract and persist: `name`, `description`, `thumbnailUrl`, `sources`, `categories`, `dateAdded`, `duration`, `cast`, and `rawDescriptionDiv`.
- **AND** it SHALL attempt to find and store an image and **gender** for each cast member using the `findStarImage` utility.
