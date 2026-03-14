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
RUN pnpm deploy --filter api --prod /app/deployed

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/deployed/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/deployed/package.json ./
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/main.js"]
