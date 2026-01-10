# Add Rotating Proxy for Scraping

## Goal Description

Integrate `zhaowde/rotating-tor-http-proxy` into the Docker Compose stack and update scraping logic to route requests through this proxy. This aims to resolve rate-limiting issues encountered during web scraping by rotating IP addresses.

## User Review Required
>
> [!IMPORTANT]
> This change introduces a new service `tor-proxy` to the stack.
> It requires a new environment variable `PROXY_URL` (defaulting to the internal docker service URL).

## Proposed Changes

### Configuration

#### [MODIFY] [docker-compose.dev.yml](file:///home/tdk_rage/Projects/tdk_rage/Bloop/docker-compose.dev.yml)

- Add `tor-proxy` service using `zhaowde/rotating-tor-http-proxy:latest`.
- Expose necessary ports or keep internal to network.

#### [MODIFY] [.env.example](file:///home/tdk_rage/Projects/tdk_rage/Bloop/.env.example)

- Add `PROXY_URL` variable.

### Backend

#### [MODIFY] [ScrapingUtils.ts](file:///home/tdk_rage/Projects/tdk_rage/Bloop/apps/backend/src/utils/ScrapingUtils.ts)

- Update `fetchPageHTML` to use the proxy agent if configured.

### Temporal Worker

#### [MODIFY] [scraping.ts](file:///home/tdk_rage/Projects/tdk_rage/Bloop/apps/temporal-worker/src/activities/scraping.ts)

- Update `fetchPageHTML` to use the proxy agent if configured.

#### [MODIFY] [Scraping.service.ts](file:///home/tdk_rage/Projects/tdk_rage/Bloop/apps/temporal-worker/src/utils/Scraping.service.ts)

- Update `fetchPageHTML` to use the proxy agent if configured.

## Verification Plan

### Automated Tests

- Run `npm run test` (if applicable).
- Create a test script/unit test that verifies IP rotation (hits a "what is my ip" service through the proxy multiple times).

### Manual Verification

- `docker compose up` and ensure `tor-proxy` starts healthy.
- Trigger a scraping job and verify logs show successful connection via proxy.
- Verify that rate limiting errors are reduced/eliminated.
