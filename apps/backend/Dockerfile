FROM node:22-alpine AS base

WORKDIR /app
RUN corepack enable

# -----------------------
# DEV
# -----------------------
FROM base AS dev

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/package.json

RUN pnpm install

COPY . .

CMD ["pnpm", "--filter", "backend", "start:dev"]

# -----------------------
# PRUNE (Turbo optimization)
# -----------------------
FROM base AS pruner

COPY . .

RUN pnpm dlx turbo prune backend --docker

# -----------------------
# INSTALL (prod deps only)
# -----------------------
FROM base AS installer

WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile

# -----------------------
# BUILD
# -----------------------
FROM installer AS builder

COPY --from=pruner /app/out/full/ .

RUN pnpm --filter backend build

# -----------------------
# PROD
# -----------------------
FROM node:22-alpine AS prod

WORKDIR /app
RUN corepack enable

COPY --from=installer /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json

WORKDIR /app/apps/backend

CMD ["node", "dist/main.js"]
