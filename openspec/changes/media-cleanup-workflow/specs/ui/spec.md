# ui Specification Delta

## MODIFIED Requirements

### Requirement: Settings Page
The system SHALL provide a dedicated page at `/settings` for administrative tasks and configuration.

#### ADDED Scenario: Trigger Media Cleanup
- **GIVEN** the settings page
- **WHEN** the user clicks the "Cleanup Media Sources" button
- **THEN** the system SHALL trigger the `mediaCleanupWorkflow`
- **AND** a confirmation toast SHALL be displayed
