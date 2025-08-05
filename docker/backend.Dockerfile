FROM node:20-alpine

# Install pnpm
RUN corepack enable pnpm

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy backend package.json
COPY apps/backend/package.json ./apps/backend/package.json

# Install dependencies (this will install for the entire workspace)
RUN pnpm install 

# Copy backend source code
COPY apps/backend ./apps/backend

# Expose the port
EXPOSE 3001

# Set working directory to backend for running the app
WORKDIR /app/apps/backend

# Run development server
CMD ["pnpm", "dev"]