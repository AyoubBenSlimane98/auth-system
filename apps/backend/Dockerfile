# -----------------------
# BASE
# -----------------------
FROM node:22-alpine AS base

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable \
  && corepack prepare pnpm@11.1.3 --activate


# -----------------------
# BUILD DEPS
# -----------------------
FROM base AS build-deps

RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++


# -----------------------
# PRUNE (TURBO)
# -----------------------
FROM base AS pruner

WORKDIR /app
COPY . .

RUN pnpm dlx turbo prune backend --docker


# -----------------------
# INSTALLER
# -----------------------
FROM build-deps AS installer

WORKDIR /app

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY .npmrc .npmrc

ENV PNPM_STORE_DIR=/pnpm/store

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile


# -----------------------
# BUILDER
# -----------------------
FROM installer AS builder

WORKDIR /app

COPY --from=pruner /app/out/full/ ./

ENV NODE_ENV=production

# 1. type check
RUN pnpm turbo run check-types --filter=backend

# 2. build
RUN pnpm turbo run build --filter=backend

# 3. deploy output
RUN pnpm --filter backend deploy --prod --legacy /prod/backend


# -----------------------
# PRODUCTION
# -----------------------
FROM node:22-alpine AS prod

WORKDIR /app

RUN apk add --no-cache libc6-compat dumb-init

RUN addgroup -S app && adduser -S app -G app

ENV NODE_ENV=production

COPY --from=builder /prod/backend ./

USER app

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
