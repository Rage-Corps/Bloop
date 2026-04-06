## 1. Research and Preparation
- [ ] 1.1 Analyze `apps/temporal-worker/src/activities/scraping.ts` for exact dependencies.
- [ ] 1.2 Identify all functions to move: `fetchPageHTML`, `getMaxPageIndex`, `fetchAndExtractLinks`, `filterMediaLinks`, `processLink`.
- [ ] 1.3 Check `packages/scraper/package.json` for `undici`.

## 2. Implementation - `@bloop/scraper`
- [ ] 2.1 Update `packages/scraper/package.json` to include `undici`.
- [ ] 2.2 Move `fetchPageHTML` to `packages/scraper/src/index.ts`.
- [ ] 2.3 Move `getMaxPageIndex` to `packages/scraper/src/index.ts`.
- [ ] 2.4 Move `filterMediaLinks` to `packages/scraper/src/index.ts`.
- [ ] 2.5 Move `fetchAndExtractLinks` to `packages/scraper/src/index.ts`.
- [ ] 2.6 Move `processLink` to `packages/scraper/src/index.ts`.
- [ ] 2.7 Export all new functions from `packages/scraper/src/index.ts`.
- [ ] 2.8 Run build in `packages/scraper` to ensure no errors.

## 3. Implementation - `apps/temporal-worker`
- [ ] 3.1 Update `apps/temporal-worker/src/activities/scraping.ts` to import moved functions from `@bloop/scraper`.
- [ ] 3.2 Remove local implementations of moved functions.
- [ ] 3.3 Ensure environment variables (like `PROXY_URL`) are handled correctly.
- [ ] 3.4 Run build in `apps/temporal-worker` (via `docker compose` or direct build) to ensure no errors.

## 4. Verification
- [ ] 4.1 Verify that the worker still builds and runs correctly.
- [ ] 4.2 Confirm no functional changes to the scraping logic.
- [ ] 4.3 Validate the change with `openspec validate refactor-move-process-link-to-scraper --strict`.
