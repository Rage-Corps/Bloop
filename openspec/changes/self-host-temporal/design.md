# Design: Self-Hosted Temporal Server

## Architecture

The Temporal server will be integrated into the existing Docker Compose network.

### Components

1. **Temporal Server**: The core service `temporalio/auto-setup` will be used for simplicity, as it handles schema migration and service startup.
2. **Temporal UI**: `temporalio/ui` will be added to provide a web interface for monitoring workflows.
3. **Persistence**: Temporal will use the `postgres` service. We'll need to create a separate database (e.g., `temporal`) or use the existing one with a prefix/different schema if supported, but usually, a separate database is cleaner.

### Docker Compose Integration

- **Dev**: Add `temporal` and `temporal-ui` services. Map ports `7233` (GRPC) and `8080` (UI).
- **Prod**: Add the same services, but with production-appropriate configurations.

### Environment Variables

- `TEMPORAL_ADDRESS`: Defaults to `temporal:7233` within the Docker network.
- `TEMPORAL_UI_PORT`: Defaults to `8080`.
