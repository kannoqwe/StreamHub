# Testing

Tests are kept outside production source files. Backend unit tests live under:

```text
apps/backend/test/unit
```

Current layout:

- `auth` - authentication and refresh-token behavior.
- `chat` - chat ingest use cases.
- `follow` - follow/unfollow service invariants.
- `ingest` - SRS hook controller behavior.
- `stream` - stream lifecycle and HLS proxy behavior.

## Commands

Run backend unit tests:

```bash
pnpm --filter @streamhub/api exec jest --runInBand
```

Run backend lint and build:

```bash
pnpm --filter @streamhub/api lint
pnpm --filter @streamhub/api build
```

Run the full local backend check:

```bash
pnpm --filter @streamhub/api exec jest --runInBand
pnpm --filter @streamhub/api lint
pnpm --filter @streamhub/api build
```

## Test Architecture

Use Nest `TestingModule` for service and controller tests. Provide dependencies through typed mock providers:

```ts
const redis: jest.Mocked<Pick<RedisService, 'get' | 'set'>> = {
    get: jest.fn(),
    set: jest.fn(),
};

const moduleRef = await Test.createTestingModule({
    providers: [
        ServiceUnderTest,
        { provide: RedisService, useValue: redis },
    ],
}).compile();
```

Do not instantiate services with untyped dependency casts.

Avoid:

```ts
new ServiceUnderTest(redis as never);
```

## Typing Rules

Test code follows the same typing expectations as production code:

- Do not use `as never`.
- Do not use `as any`.
- Do not use `unknown as SomeType`.
- Do not use `@ts-ignore`.
- Prefer `jest.Mocked<Pick<Service, 'method'>>` for class mocks.
- For overloaded APIs, create a narrow local mock type instead of forcing the original overload type.

Example for an overloaded config getter:

```ts
type ConfigServiceMock = {
    get: jest.Mock<string | undefined, [string]>;
};
```

## What Is Covered

Current backend unit coverage includes:

- refresh-token revocation on logout;
- SRS ingest hook secret validation;
- stream lifecycle publish/unpublish behavior;
- HLS playlist and segment proxy behavior;
- follow/unfollow counters and duplicate handling;
- chat ingest deduplication, history enqueue, and broadcast flow.

## Next Tests To Add

Recommended next steps:

- backend integration tests for auth login -> refresh -> logout -> revoked refresh;
- backend integration tests for SRS publish hook -> active stream page -> unpublish;
- edge Go tests for origin validation and HTTP auth verifier behavior;
- Docker Compose smoke tests for frontend, backend, edge, and SRS startup.
