# Design: Rotating Proxy Integration

## Context

The application performs web scraping which is currently hitting rate limits. To mitigate this, we will route traffic through a Tor-based rotating proxy.

## Architecture

### Proxy Service

We will use the `zhaowde/rotating-tor-http-proxy:latest` image.

- **Service Name**: `tor-proxy`
- **Internal Port**: `3128` (default for many proxies, or check image docs - image uses 3128 usually, but we should verify. The user specified `zhaowde/rotating-tor-http-proxy`).
- **Network**: Attached to `dev-network`.

### Client Integration

Both the Backend setup (`fetch`) and Temporal Worker setup (`axios` or `fetch`) need to be configured to use an HTTP proxy agent.

- **Node.js Environment**:
  - We will use `https-proxy-agent` (or similar node-native way if available in recent node versions, but `https-proxy-agent` is standard for `node-fetch`).
  - For `axios` (used in worker), we can configure the `proxy` config or an agent.
  - For `fetch` (used in backend - likely `node-fetch` or native fetch), we need to inject the `dispatcher` (for `undici`/native fetch) or `agent`.

### Configuration

- New Env Var: `PROXY_URL`
- Default Value: `http://tor-proxy:3128` (internal docker DNS).
- Logic: If `PROXY_URL` is set, all scraping requests use it.

## Trade-offs

- **Latency**: Tor proxies are generally slower. We need to increase timeouts.
- **Reliability**: Tor nodes can be flaky. We might need retry logic (which `bullmq` / `temporal` already provide, but application-level retries might be needed for specific connection errors).
