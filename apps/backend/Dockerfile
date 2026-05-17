# -----------------------
# BASE
# -----------------------
FROM node:22-alpine AS base

WORKDIR /app

RUN corepack enable \
  && corepack prepare pnpm@10.33.0 --activate


# -----------------------
# BUILD DEPS (native modules)
# -----------------------
FROM base AS build-deps

RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++


# -----------------------
# PRUNER (turbo)
# -----------------------
FROM base AS pruner

WORKDIR /app

COPY . .

RUN pnpm dlx turbo prune backend --docker


# -----------------------
# INSTALL (dependencies)
# -----------------------
FROM build-deps AS installer

WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# pnpm store cache (faster CI builds)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm fetch --frozen-lockfile

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --offline --frozen-lockfile


# -----------------------
# DEV
# -----------------------
FROM build-deps AS dev

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/package.json

RUN pnpm install

COPY . .

CMD ["pnpm", "turbo", "run", "dev", "--filter=backend"]


# -----------------------
# BUILDER
# -----------------------
FROM installer AS builder

WORKDIR /app

COPY --from=pruner /app/out/full/ .

RUN pnpm --filter backend build

RUN pnpm --filter backend deploy --prod /prod/backend


# -----------------------
# PRODUCTION RUNTIME
# -----------------------
FROM node:22-alpine AS prod

WORKDIR /app

RUN apk add --no-cache libc6-compat dumb-init

# create non-root user (security best practice)
RUN addgroup -S app && adduser -S app -G app

ENV NODE_ENV=production

COPY --from=builder /prod/backend ./

USER app

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main.js"]
