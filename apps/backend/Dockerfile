FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable

RUN pnpm install --frozen-lockfile
COPY . .

RUN pnpm run prisma:generate
RUN pnpm run build

CMD ["pnpm", "start"]