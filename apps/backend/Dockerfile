FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable

RUN pnpm install --frozen-lockfile
COPY . .

RUN pnpm run prisma:generate
RUN pnpm run build
# RUN pnpm prune --prod

FROM node:22-alpine AS runtime

USER node

COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./

CMD ["node", "dist/src/main.js"]