# Proposal: Media Source Cleanup Workflow

## Context
Our media library can accumulate dead or broken media sources over time. We need a maintenance feature to identify and remove these sources, ensuring data integrity and a better user experience. This requires a new UI trigger, a backend API, and a robust Temporal workflow for long-running validation and cascading deletions.

## Objectives
- Provide a UI trigger in the Settings page for manual maintenance.
- Implement a Temporal workflow to reliably validate media sources via HTTP status and content inspection.
- Automate the cleanup of broken sources and perform cascading deletions of orphaned Media entities and their associated relations.

## Scope
- **UI:** Add "Cleanup Media Sources" button to `/settings`.
- **API:** New endpoint `POST /api/media/cleanup` to trigger the workflow.
- **Workflow:** `mediaCleanupWorkflow` implementing validation logic.
- **Database:** Transactional deletion of sources and orphaned media records.

## Out of Scope
- Automatic/Scheduled cleanup (can be added later via Temporal Schedules).
- Advanced content inspection (e.g., video segment analysis).
- UI for tracking real-time progress of the cleanup (beyond initial trigger confirmation).
