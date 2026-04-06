# Change: Move processLink and related scraper utilities to the scraper package

## Why
The `processLink` function and its supporting utilities (`fetchPageHTML`, `filterMediaLinks`, `getMaxPageIndex`, etc.) are currently located in the `temporal-worker` application. These are general-purpose scraping logics that should be reusable and isolated in the `@bloop/scraper` package. This improves maintainability and allows other parts of the system to use these scraping capabilities without depending on the Temporal worker.

## What Changes
- **MODIFIED**: `packages/scraper/src/index.ts`
  - Added `fetchPageHTML`: Robust fetching with retries and proxy support.
  - Added `processLink`: Orchestrates fetching and metadata extraction.
  - Added `filterMediaLinks`: Filter links by base URL and excluded paths.
  - Added `getMaxPageIndex`: Extract the maximum page number from pagination links.
  - Added `fetchAndExtractLinks`: Fetch a page and extract filtered links.
- **MODIFIED**: `apps/temporal-worker/src/activities/scraping.ts`
  - Removed local implementations of the moved functions.
  - Imported them from `@bloop/scraper`.
- **MODIFIED**: `packages/scraper/package.json`
  - Added `undici` as a dependency for `ProxyAgent` support in `fetchPageHTML`.

## Impact
- **Affected code**: `apps/temporal-worker/src/activities/scraping.ts`, `packages/scraper/src/index.ts`.
- **Breaking changes**: None for the system behavior, but internal API shift between modules.
