FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --filter @streamhub/web...

COPY apps/frontend ./apps/frontend
COPY packages/shared ./packages/shared

WORKDIR /app/apps/frontend

EXPOSE 5173

CMD ["pnpm", "dev", "--host", "0.0.0.0"]