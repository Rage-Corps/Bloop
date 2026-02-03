FROM node:22-alpine

# Install pnpm and wget for health checks
RUN corepack enable pnpm && apk add --no-cache wget

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for workspace packages
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json
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

# Copy frontend source code
COPY apps/frontend ./apps/frontend

# Expose the port (Nuxt dev server default port is 3000)
EXPOSE 3000

# Set working directory to frontend for running the app
WORKDIR /app/apps/frontend

# Run development server
CMD ["pnpm", "dev"]