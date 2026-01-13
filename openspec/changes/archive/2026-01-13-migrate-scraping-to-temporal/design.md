## Context
The project currently uses BullMQ for queuing and `node-cron` for scheduling scraping tasks in the backend. A Temporal worker was recently introduced but lacks full feature parity with the backend scraping logic and does not yet handle scheduling or robust error recovery for proxy-related 403 errors.

## Goals
- Unified scraping infrastructure using Temporal.
- Full parity between Temporal scraping results and the backend's original scraping logic.
- Robust handling of proxy-induced 403 errors.
- Clean, well-documented REST API for triggering and monitoring scraping workflows.

## Decisions
### 1. Error Handling in `fetchPageHTML`
- **Decision**: Implement a retry loop specifically for 403 status codes within the `fetchPageHTML` activity.
- **Rationale**: While Temporal has a global retry policy, a 403 error specifically indicates a proxy rejection that often resolves with a delay (IP rotation). A local retry with a 30s sleep is more targeted than a general activity retry which might have different backoff characteristics.

### 2. Parity in Data Fields
- **Decision**: Update `mediaScrapeWorkflow` to pass `duration`, `cast`, and `rawDescriptionDiv` to the `saveMedia` activity.
- **Rationale**: These fields are extracted by `processLink` but currently discarded during the workflow execution before saving to the database.

### 3. REST API Renaming
- **Decision**: Consolidate endpoints under `/api/scraping/`.
  - `POST /api/scraping/trigger` -> Start a manual scraping workflow.
  - `GET /api/scraping/status` -> List active and recent workflows.
  - `POST /api/scraping/terminate/:workflowId` -> Terminate a specific workflow.
  - `POST /api/scraping/terminate-all` -> Terminate all running workflows.
- **Rationale**: Standardize on Temporal-backed endpoints and use more descriptive verbs.

### 4. Scheduling Migration
- **Decision**: Replace `CronService` logic with Temporal Schedules.
- **Rationale**: Temporal Schedules provide much better durability and visibility than `node-cron`. If the worker or server goes down, Temporal will catch up or maintain the schedule.

## Risks / Trade-offs
- **Migration of Settings**: Existing cron settings in the database need to be mapped to Temporal Schedules.
- **Operational Complexity**: Adds a stronger dependency on the Temporal server for all scraping operations.

## Open Questions
- Should we provide a UI/API to dynamically update the Temporal Schedule frequency based on the current database settings? (Yes, this will be handled in the backend routes).
