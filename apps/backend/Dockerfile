FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages ./packages

RUN pnpm install

COPY . .

CMD ["pnpm", "--filter", "backend", "dev"] 
