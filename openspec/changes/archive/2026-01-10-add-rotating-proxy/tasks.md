# Tasks

- [x] Add `tor-proxy` service to `docker-compose.dev.yml` <!-- id: 0 -->
- [x] Add `PROXY_URL` to `.env.example` (and local `.env` instruction) <!-- id: 1 -->
- [x] Install `https-proxy-agent` (or `undici` dispatcher) in backend and worker packages <!-- id: 2 -->
- [x] Update `apps/backend/src/utils/ScrapingUtils.ts` to use proxy agent <!-- id: 3 -->
- [x] Update `apps/temporal-worker/src/activities/scraping.ts` to use proxy agent <!-- id: 4 -->
- [x] Update `apps/temporal-worker/src/utils/Scraping.service.ts` to use proxy agent <!-- id: 5 -->
- [ ] Verify `docker compose up` starts proxy <!-- id: 6 -->
- [ ] Verify scraping works with proxy enabled <!-- id: 7 -->
