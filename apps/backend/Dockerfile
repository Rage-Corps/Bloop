# Dockerfile (apps/backend/Dockerfile)
# Production Dockerfile

FROM node:22-alpine

# Install build dependencies for sqlite3 and native modules
RUN apk add --no-cache python3 make g++ sqlite

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy monorepo package files
COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./

# Copy backend package.json
COPY apps/backend/package.json ./apps/backend/

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# Copy backend source code only
COPY apps/backend ./apps/backend

# Build the backend application
WORKDIR /app/apps/backend
RUN pnpm build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Create data directory and set permissions
RUN mkdir -p /app/apps/backend/data && chown -R backend:nodejs /app/apps/backend/data
RUN chown -R backend:nodejs /app

# Switch to non-root user
USER backend

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["pnpm", "start"]