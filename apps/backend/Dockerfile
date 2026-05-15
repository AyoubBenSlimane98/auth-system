# -----------------------
# BASE
# -----------------------
FROM node:22-alpine AS base

WORKDIR /app

RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
  && corepack enable \
  && corepack prepare pnpm@10.33.0 --activate


# -----------------------
# PRUNER
# -----------------------
FROM base AS pruner

WORKDIR /app

COPY . .

RUN pnpm dlx turbo prune backend --docker


# -----------------------
# INSTALL
# -----------------------
FROM base AS installer

WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile


# -----------------------
# BUILDER
# -----------------------
FROM installer AS builder

WORKDIR /app

COPY --from=pruner /app/out/full/ .

RUN pnpm --filter backend build

RUN pnpm --filter backend deploy --prod /prod/backend


# -----------------------
# PRODUCTION
# -----------------------
FROM node:22-alpine AS prod

WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production

COPY --from=builder /prod/backend ./

EXPOSE 10000

CMD ["node", "dist/main.js"]
