FROM node:22-alpine

RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --filter @streamhub/api...

COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared

WORKDIR /app/apps/backend
RUN npx prisma generate

CMD ["pnpm", "start:dev"]