FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies and workspace structure
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/.npmrc ./.npmrc
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages

# Overwrite with actual source code
COPY apps/api ./apps/api

# Generate Prisma Client
RUN cd /app/apps/api && npx prisma generate

# Build TypeScript (from root, using pnpm filter)
RUN pnpm --filter api build

# Production image
FROM base AS runner
WORKDIR /app

# Install runtime dependencies: OpenSSL for Prisma, wget for healthcheck
RUN apk add --no-cache openssl wget

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

# Copy the entire monorepo structure to maintain proper paths
COPY --from=builder --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=apiuser:nodejs /app/package.json ./package.json
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/prisma ./apps/api/prisma

# Copy and setup startup script
COPY --chown=apiuser:nodejs apps/api/start.sh /app/start.sh
RUN chmod +x /app/start.sh

USER apiuser

EXPOSE 3000

CMD ["/app/start.sh"]
