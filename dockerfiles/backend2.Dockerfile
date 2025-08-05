FROM node:20-alpine

# Install pnpm
RUN corepack enable pnpm

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy backend2 package.json
COPY apps/backend2/package.json ./apps/backend2/package.json

# Install dependencies (this will install for the entire workspace)
RUN pnpm install --frozen-lockfile

# Copy backend2 source code
COPY apps/backend2 ./apps/backend2

# Expose the port
EXPOSE 3001

# Set working directory to backend2 for running the app
WORKDIR /app/apps/backend2

# Run development server
CMD ["pnpm", "dev"]