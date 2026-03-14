# Build stage
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.32.0 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile
COPY apps/api/ apps/api/
COPY tsconfig.base.json ./
RUN pnpm --filter api build

# Prune dev dependencies
ENV CI=true
RUN pnpm prune --prod

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/main.js"]
