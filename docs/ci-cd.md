# CI/CD

CI/CD is the automation that checks, packages, and deploys the project.

- CI means Continuous Integration: every pull request and every push to `main` is checked automatically.
- CD means Continuous Delivery/Deployment: after code is accepted, GitHub can build Docker images and deploy them to a server.

This repo now has three GitHub Actions workflows:

- `.github/workflows/ci.yml`
- `.github/workflows/publish.yml`
- `.github/workflows/deploy.yml`

## The Pipeline

The intended flow is:

1. You push a branch or open a pull request.
2. `CI` runs lint, tests, builds, and Docker image build checks.
3. You merge to `main`.
4. `Publish Images` builds production Docker images and pushes them to GitHub Container Registry.
5. You run `Deploy` manually when you want the VPS to pull a specific image tag and restart.

Manual deployment is intentional. It gives you a clear checkpoint before replacing the running app.

## CI Workflow

File: `.github/workflows/ci.yml`

Runs on:

- every pull request;
- every push to `main`.

Jobs:

1. `Node apps`
   - installs dependencies with pnpm;
   - generates Prisma client;
   - lints backend;
   - runs backend Jest tests;
   - builds backend;
   - lints frontend;
   - builds frontend.

2. `Edge service`
   - installs Go;
   - runs `go test ./...`;
   - builds the Go edge service.

3. `Docker build`
   - builds production Docker images for frontend, backend, and edge;
   - does not push them anywhere;
   - catches broken Dockerfiles before merge.

Think of CI as the gatekeeper. If CI is red, do not merge.

## Publish Workflow

File: `.github/workflows/publish.yml`

Runs on:

- push to `main`;
- tags like `v1.2.0`;
- manual run through GitHub Actions.

It publishes three images:

- `ghcr.io/<owner>/<repo>/frontend`
- `ghcr.io/<owner>/<repo>/backend`
- `ghcr.io/<owner>/<repo>/edge`

Each image gets tags:

- `main` when built from the `main` branch;
- `sha-<commit>` for an exact immutable version;
- `1.2.0` and `1.2` when built from a git tag like `v1.2.0`.

For production, prefer deploying `sha-<commit>` or a version tag. `main` is convenient, but it moves every time `main` changes.

## Deploy Workflow

File: `.github/workflows/deploy.yml`

Runs only manually through GitHub Actions.

It:

1. connects to your VPS through SSH;
2. uploads `docker-compose.prod.yml`, `scylla-init.cql`, and `apps/srs/srs.conf.template`;
3. writes the production `.env` from the `DEPLOY_ENV` GitHub secret;
4. logs in to GitHub Container Registry if `GHCR_TOKEN` is set;
5. runs:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans
docker image prune -f
```

The deploy workflow has one input:

- `image_tag`: the Docker tag to deploy, for example `main`, `sha-abc1234`, or `1.2.0`.

## Required GitHub Settings

For publishing images to GHCR:

1. Open repository `Settings`.
2. Go to `Actions` -> `General`.
3. Under `Workflow permissions`, select `Read and write permissions`.

The workflow also declares:

```yaml
permissions:
  contents: read
  packages: write
```

## Required Secrets

Add these in GitHub:

`Settings` -> `Secrets and variables` -> `Actions` -> `Repository secrets`.

Required for deploy:

- `DEPLOY_HOST`: server IP or domain, for example `203.0.113.10`.
- `DEPLOY_USER`: SSH user, for example `deploy`.
- `DEPLOY_SSH_KEY`: private SSH key that can log in as `DEPLOY_USER`.
- `DEPLOY_PATH`: directory on the server, for example `/opt/streamhub`.
- `DEPLOY_ENV`: complete production env file content.

Optional:

- `DEPLOY_PORT`: SSH port. Defaults to `22`.
- `GHCR_TOKEN`: GitHub PAT with `read:packages` if your GHCR packages are private.

Use `.env.production.example` as the template for `DEPLOY_ENV`.

## Required Variables

Add these in:

`Settings` -> `Secrets and variables` -> `Actions` -> `Variables`.

Optional build variables:

- `VITE_API_URL`: defaults to `/api`.
- `VITE_WS_URL`: defaults to `/ws`.

For the provided production compose, the defaults are correct because nginx proxies:

- `/api/*` to backend;
- `/ws` to edge.

## VPS Requirements

The server must have:

- Docker;
- Docker Compose plugin, so `docker compose version` works;
- SSH access for the deploy user;
- enough RAM for Postgres, Redis, NATS, Scylla, SRS, backend, edge, and frontend.

Create the deploy directory once:

```bash
sudo mkdir -p /opt/streamhub
sudo chown deploy:deploy /opt/streamhub
```

If GHCR images are private, create a PAT with `read:packages` and store it as `GHCR_TOKEN`.

## Production Compose

File: `docker-compose.prod.yml`

It runs:

- frontend nginx image;
- NestJS backend image;
- Go edge image;
- Postgres;
- Redis;
- NATS JetStream;
- Scylla;
- SRS.

The production compose uses images from GHCR instead of building locally:

```yaml
image: ${GHCR_REPOSITORY}/backend:${IMAGE_TAG:-main}
```

The deploy workflow sets:

- `GHCR_REPOSITORY=ghcr.io/<owner>/<repo>`
- `IMAGE_TAG=<workflow input>`

## SRS Hook Secret

SRS needs the same ingest hook secret as backend.

The production compose does not use the hardcoded local `apps/srs/srs.conf`. It uses:

- `apps/srs/srs.conf.template`
- `INGEST_HOOK_SECRET` from `.env`

At container startup, the template placeholder is replaced:

```text
__INGEST_HOOK_SECRET__
```

This keeps the real secret out of git.

## How To Use It

Normal development:

1. Create a branch.
2. Push branch.
3. Open pull request.
4. Wait for `CI` to pass.
5. Merge to `main`.

Publish:

1. Merge to `main`.
2. `Publish Images` runs automatically.
3. Check GitHub `Actions` and `Packages`.

Deploy:

1. Open GitHub `Actions`.
2. Choose `Deploy`.
3. Click `Run workflow`.
4. Enter `image_tag`, usually `main` at first.
5. Watch logs.
6. SSH into server and check:

```bash
cd /opt/streamhub
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
```

## Rollback

Every published image gets a `sha-<commit>` tag.

To roll back:

1. Find the previous good `sha-...` tag in GitHub Packages.
2. Run the `Deploy` workflow again.
3. Use that `sha-...` as `image_tag`.

That is the main reason SHA tags matter: they point to one exact build.

## Current Limits

This is a working baseline, not a full enterprise deployment platform.

Known follow-ups:

- add database migration step before backend starts;
- add healthcheck endpoints for backend and edge;
- put TLS/domain routing in front of frontend, for example Caddy, Traefik, or cloud load balancer;
- add smoke tests after deploy;
- split frontend bundle to remove the current Vite chunk-size warning.
