# Change: Migrate Scraping to Temporal

## Why
Consolidate all scraping, queuing, and scheduling logic into Temporal to improve reliability, visibility, and scalability. The current dual implementation (BullMQ + node-cron in backend and Temporal worker) leads to logic divergence and maintenance overhead. This migration ensures parity between the worker and the former backend source of truth while simplifying the backend architecture.

## What Changes
- **Backend Refactoring**:
    - **REMOVED**: BullMQ queue configuration and worker initialization.
    - **REMOVED**: `CronService` and `node-cron` dependency.
    - **REMOVED**: Bull Board (`/admin/queues`) admin interface.
    - **REMOVED**: Legacy scraping endpoints (`/scraping/start`, `/scraping/jobs`, `/scraping/stop`).
    - **MODIFIED**: REST endpoints updated for clarity and Swagger documentation.
- **Temporal Worker Enhancements**:
    - **ADDED**: Missing fields to `saveMedia` activity for parity: `duration`, `cast`, and `rawDescriptionDiv`.
    - **MODIFIED**: `fetchPageHTML` activity to handle HTTP 403 errors with a 30-second backoff/retry loop to handle proxy IP rotations.
- **Scheduling**:
    - **ADDED**: Integration for Temporal Schedules to replace `node-cron` based scraping.

## Impact
- **Affected specs**: `scraping`, `server`, `config`.
- **Affected code**: `apps/backend/src/server.ts`, `apps/backend/src/routes/scraping.ts`, `apps/backend/src/services/CronService.ts`, `apps/temporal-worker/src/activities/scraping.ts`, `apps/temporal-worker/src/workflows/mediaScrapeWorkflow.ts`.
- **BREAKING**: Existing REST API endpoints for scraping and cron settings are replaced or modified.
