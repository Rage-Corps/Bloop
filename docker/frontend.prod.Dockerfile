# Simple build to inspect structure
FROM node:22-alpine AS builder

RUN corepack enable pnpm && apk add --no-cache curl

WORKDIR /app

# Copy everything first to see what we're working with
COPY package.json pnpm-workspace.yaml ./
COPY ./apps/frontend ./apps/frontend
COPY ./packages ./packages

# Install dependencies
WORKDIR /app
RUN pnpm install

# Fix CSS path for Docker build
WORKDIR /app/apps/frontend
RUN sed -i "s|~/assets/css/main.css|./app/assets/css/main.css|g" nuxt.config.ts

# Build the frontend in production mode
ENV NODE_ENV=production
RUN pnpm run build

# Stay in the frontend directory
WORKDIR /app/apps/frontend

# Stage 2: Serve the Nuxt application
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/frontend/.output ./apps/frontend/.output

WORKDIR /app/apps/frontend/.output


RUN echo "NUXT_PUBLIC_BACKEND_URL=${NUXT_PUBLIC_BACKEND_URL}"

EXPOSE 3000

# Keep container running so we can inspect it
# CMD ["tail", "-f", "/dev/null"]
CMD ["node", "server/index.mjs"]