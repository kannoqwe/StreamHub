<h1 align="center">
  <img src="docs/images/logo.svg" alt="StreamHub logo" width="56" />
  <span style="position: relative; top: -18px;">StreamHub</span>
</h1>

<p align="center">
  <b>Open-source live streaming platform</b><br />
  Realtime chat, edge delivery, and creator tools in one stack.
</p>

<p align="center">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-1f6feb.svg" alt="MIT License" />
  </a>
</p>

## Monorepo Structure

- `apps/frontend` - React + Vite web client
- `apps/backend` - NestJS API (Prisma, PostgreSQL, Redis, NATS, Scylla)
- `apps/edge` - Go edge service for realtime/WebSocket flow
- `apps/srs` - SRS config for RTMP/HLS
- `packages/shared` - shared models/contracts used across apps

## Tech Stack

- Frontend: React 19, Vite, TypeScript, Tailwind
- Backend: NestJS 11, Prisma 6, PostgreSQL
- Realtime/Infra: Redis, NATS, ScyllaDB, SRS
- Edge: Go 1.25
- Tooling: pnpm workspaces, Docker Compose

## Prerequisites

- Docker Desktop (or Docker Engine) with Compose
- Git

## Quick Start (Docker)

1. Clone repository:

```bash
git clone git@github.com:kannoqwe/StreamHub.git
cd StreamHub
```

2. Create env file:

```bash
cp .env.example .env
```

3. Start all services:

```bash
docker compose up --build
```

4. Open apps:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Edge WS: `ws://localhost:8081/ws`
- SRS HTTP: `http://localhost:8080`

## Screenshots

### Home

![Home](docs/images/home.png)

### Stream

![Stream](docs/images/stream.png)

### Profile Settings

![Profile Settings](docs/images/profile-settings.png)

## Environment Variables

Use `.env.example` as a base and update values for your environment.

## License

This project is licensed under the MIT License. See `LICENSE`.
