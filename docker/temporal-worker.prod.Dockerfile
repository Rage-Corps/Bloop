FROM node:22-slim

# Install pnpm
RUN corepack enable pnpm

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for workspace packages
COPY apps/temporal-worker/package.json ./apps/temporal-worker/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json
COPY packages/database/package.json ./packages/database/package.json

# Install dependencies (this will install for the entire workspace)
RUN pnpm install

# Copy shared-types source and build it
COPY packages/shared-types ./packages/shared-types
RUN cd packages/shared-types && pnpm build

# Copy database package source and build it
COPY packages/database ./packages/database
RUN cd packages/database && pnpm build

# Copy temporal worker source code
COPY apps/temporal-worker ./apps/temporal-worker

# Build temporal worker
RUN cd apps/temporal-worker && pnpm build

# Debug: List contents to see what was actually built
RUN ls -la /app/apps/temporal-worker/
RUN ls -la /app/apps/temporal-worker/dist/ || echo "No dist directory found"

# Set working directory to temporal worker for running the app
WORKDIR /app/apps/temporal-worker

# Expose health check port (if needed)
EXPOSE 8080

# Run the temporal worker
CMD ["pnpm", "start"]