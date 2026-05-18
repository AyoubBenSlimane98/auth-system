# -----------------------
# BASE
# -----------------------
FROM node:22-alpine AS base

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable \
  && corepack prepare pnpm@10.33.0 --activate


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
# PRUNER
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

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile


# -----------------------
# BUILDER
# -----------------------
FROM installer AS builder

WORKDIR /app

COPY --from=pruner /app/out/full/ .

# type check (optional but recommended)
RUN pnpm --filter backend check-types

# build backend (NestJS + SWC)
RUN pnpm --filter backend build

RUN find dist -name "*.map" -delete

# production deploy (only backend deps)
RUN pnpm deploy --filter backend --prod /prod/backend


# -----------------------
# PRODUCTION
# -----------------------
FROM node:22-alpine AS prod

WORKDIR /app

RUN apk add --no-cache \
    libc6-compat \
    dumb-init

RUN addgroup -S app && adduser -S app -G app

ENV NODE_ENV=production

COPY --from=builder /prod/backend ./

USER app

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
