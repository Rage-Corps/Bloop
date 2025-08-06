FROM node:20-alpine

# Install pnpm and curl
RUN corepack enable pnpm && apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

# Install dependencies
RUN pnpm install

# Copy source code
COPY packages/shared-types ./packages/shared-types
COPY apps/frontend ./apps/frontend

# Build shared-types first
RUN cd packages/shared-types && pnpm build

# Build frontend
RUN cd apps/frontend && pnpm build

# Expose port
EXPOSE 3000

# Set working directory to frontend
WORKDIR /app/apps/frontend

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["node", ".output/server/index.mjs"]