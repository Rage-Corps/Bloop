# Change: Self-Host Temporal Server

## Why

Relying on an external Temporal instance introduces dependency on external infrastructure during development and can lead to connectivity issues or configuration mismatches.

## What Changes

- Add Temporal server and UI services to `docker-compose.dev.yml` and `docker-compose.prod.yml`
- Configure Temporal server to use the existing `postgres` service for persistence
- Update `backend` and `temporal-worker` services to connect to internal Temporal server by default

## Impact

- Affected specs: Infrastructure deployment
- Affected code: `docker-compose.dev.yml`, `docker-compose.prod.yml`
- Dev Experience: Developers will have a fully functional Temporal environment out of the box
- Infrastructure: Reduced reliance on external services
