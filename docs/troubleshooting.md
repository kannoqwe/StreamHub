# Troubleshooting

## Prisma migrations fail locally

Use migrations, not `db push`:

```bash
docker compose exec backend pnpm prisma:migrate:deploy
```

If the local database was created by old `db push` runs, the fastest dev-only reset is:

```bash
docker compose down -v
docker compose up --build
```

This removes local database volumes. Do not do this on production.

## Backend container says migration is missing

Create a migration from schema changes:

```bash
pnpm --filter @streamhub/api prisma:migrate:dev --name describe_change
```

Commit both `apps/backend/prisma/schema.prisma` and the new folder in `apps/backend/prisma/migrations`.

## Deploy fails before services restart

The deploy workflow now runs:

```bash
docker compose -f docker-compose.prod.yml up migrate
```

If this fails, the new backend is not started. Check the migration logs on the VPS:

```bash
cd /opt/streamhub
docker compose -f docker-compose.prod.yml logs migrate
```

## Smoke tests fail after deploy

The workflow checks:

- `http://localhost:${FRONTEND_PORT:-80}/`
- `http://localhost:${FRONTEND_PORT:-80}/api/health`
- `http://localhost:${FRONTEND_PORT:-80}/api/ready`

If `/api/health` works but `/api/ready` fails, the backend process is alive but PostgreSQL or Redis is not ready.

## Docker image reference is invalid

If Compose shows `image: /backend:main`, `GHCR_REPOSITORY` is empty. The deploy workflow sets it automatically. For manual prod-compose tests on Windows PowerShell:

```powershell
$env:GHCR_REPOSITORY="ghcr.io/owner/repo"
$env:IMAGE_TAG="main"
docker compose -f docker-compose.prod.yml config
```

In `cmd.exe`, use:

```bat
set GHCR_REPOSITORY=ghcr.io/owner/repo
set IMAGE_TAG=main
docker compose -f docker-compose.prod.yml config
```

## Stream starts but video says media could not be loaded

Check in this order:

1. SRS is reachable: `http://localhost:8080`.
2. Backend HLS proxy returns a playlist: `http://localhost:3000/stream/hls/<streamId>/index.m3u8`.
3. Frontend is using the proxied URL, not the private SRS stream key.
4. Browser Network tab shows `.m3u8` and `.ts` responses with 200 status.
5. `INGEST_HOOK_SECRET` matches in backend and SRS.

## Scylla is unhealthy on local Docker

Scylla is memory-sensitive. Close heavy apps or increase Docker Desktop memory. For local development, give Docker at least 6 GB RAM if Scylla, SRS, Postgres, Redis, NATS, backend, frontend, and edge run together.

## PowerShell blocks pnpm

If PowerShell says `pnpm.ps1 cannot be loaded`, use:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd --filter @streamhub/api test
```

This avoids changing your machine execution policy.
