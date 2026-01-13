## 1. Temporal Worker Parity & Error Handling
- [x] 1.1 Update `apps/temporal-worker/src/activities/scraping.ts` to implement 403 backoff logic in `fetchPageHTML`.
- [x] 1.2 Update `apps/temporal-worker/src/workflows/mediaScrapeWorkflow.ts` to include `duration`, `cast`, and `rawDescriptionDiv` in the `saveMedia` call.
- [x] 1.3 Verify that `processLink` output correctly populates these fields.

## 2. Backend Cleanup
- [x] 2.1 Remove BullMQ initialization and worker setup from `apps/backend/src/server.ts`.
- [x] 2.2 Remove `apps/backend/src/jobs/queue.ts` and related types.
- [x] 2.3 Remove `apps/backend/src/services/CronService.ts`.
- [x] 2.4 Update `apps/backend/src/server.ts` to remove `CronService` and Bull Board registration.
- [x] 2.5 Delete `apps/backend/src/utils/ScrapingUtils.ts` (as it's now redundant).

## 3. REST API Update
- [x] 3.1 Refactor `apps/backend/src/routes/scraping.ts`:
    - Remove old BullMQ routes.
    - Implement/Rename Temporal routes: `/trigger`, `/status`, `/terminate/:workflowId`, `/terminate-all`.
    - Enhance Swagger documentation for all routes.
- [x] 3.2 Update `apps/backend/src/routes/settings.ts` to interact with Temporal Schedules instead of `CronService` for cron configuration.

## 4. Scheduling Implementation
- [x] 4.1 Implement a helper in backend to manage (create/update/delete) Temporal Schedules.
- [x] 4.2 Ensure existing database settings for cron are synced to Temporal Schedules on startup or update.

## 5. Validation
- [x] 5.1 Run backend and worker to ensure no compilation errors.
- [x] 5.2 Test manual scraping trigger via new REST API.
- [x] 5.3 Test 403 backoff logic by simulating a 403 response (optional/manual check).
- [x] 5.4 Verify data parity in database after a successful scrape.

