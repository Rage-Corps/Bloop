FROM node:22-alpine

# Install pnpm and wget for health checks
RUN corepack enable pnpm && apk add --no-cache wget

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for workspace packages
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

# Install dependencies (this will install for the entire workspace)
RUN pnpm install 

# Copy shared-types source and build it
COPY packages/shared-types ./packages/shared-types
RUN cd packages/shared-types && pnpm build

# Copy backend source code
COPY apps/backend ./apps/backend

# Expose the port
EXPOSE 3001

# Set working directory to backend for running the app
WORKDIR /app/apps/backend

# Run development server with database initialization
CMD ["pnpm", "dev:with-init"]