import { StreamService } from '@modules/stream/stream.service';
import { Test } from '@nestjs/testing';
import { StreamLifecycleService } from '@modules/stream/services/lifecycle.service';
import { StreamPageService } from '@modules/stream/services/page.service';
import { StreamFeedService } from '@modules/stream/services/feed.service';
import { StreamRepository } from '@modules/stream/stream.repository';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@modules/redis/redis.service';

describe('StreamService HLS proxy', () => {
    let service: StreamService;

    type ActiveStream = {
        id: number;
        isLive: boolean;
        streamer: {
            streamKey: string;
        };
    };

    type StreamRepositoryMock = {
        findActiveStreamById: jest.Mock<Promise<ActiveStream | null>, [number]>;
    };

    type ConfigServiceMock = {
        get: jest.Mock<string | undefined, [string]>;
    };

    const repository: StreamRepositoryMock = {
        findActiveStreamById: jest.fn<Promise<ActiveStream | null>, [number]>(),
    };
    const config: ConfigServiceMock = {
        get: jest.fn((key: string) => {
            if (key === 'srs.hlsBaseUrl') return 'http://srs:8080';
            if (key === 'srs.hlsPath') return '/live';
            return undefined;
        }),
    };
    const redis: jest.Mocked<Pick<RedisService, 'set' | 'get'>> = {
        set: jest.fn(),
        get: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const moduleRef = await Test.createTestingModule({
            providers: [
                StreamService,
                { provide: StreamLifecycleService, useValue: {} },
                { provide: StreamPageService, useValue: {} },
                { provide: StreamFeedService, useValue: {} },
                { provide: StreamRepository, useValue: repository },
                { provide: ConfigService, useValue: config },
                { provide: RedisService, useValue: redis },
            ],
        }).compile();

        service = moduleRef.get(StreamService);
    });

    it('proxies playlists through opaque segment tokens', async () => {
        repository.findActiveStreamById.mockResolvedValue({
            id: 10,
            isLive: true,
            streamer: { streamKey: 'live_private_secret' },
        });
        const fetchMock: jest.MockedFunction<typeof fetch> = jest
            .fn()
            .mockResolvedValue(
                new Response(
                    '#EXTM3U\n#EXTINF:1.0,\nlive_private_secret-0.ts\n',
                    {
                        headers: {
                            'content-type': 'application/vnd.apple.mpegurl',
                        },
                    },
                ),
            );
        global.fetch = fetchMock;

        const result = await service.getHlsAsset(10, 'index.m3u8');

        expect(fetchMock).toHaveBeenCalledWith(
            'http://srs:8080/live/live_private_secret.m3u8',
        );
        expect(result.body).not.toContain('/stream/hls/10/');
        expect(result.body).not.toContain('live_private_secret');
        expect(redis.set).toHaveBeenCalledWith(
            expect.stringMatching(/^stream:hls:10:/),
            'live_private_secret-0.ts',
            300,
        );
    });

    it('recovers segment tokens from the upstream playlist when redis misses', async () => {
        repository.findActiveStreamById.mockResolvedValue({
            id: 10,
            isLive: true,
            streamer: { streamKey: 'live_private_secret' },
        });
        redis.get.mockResolvedValue(null);

        const fetchMock: jest.MockedFunction<typeof fetch> = jest
            .fn()
            .mockResolvedValueOnce(
                new Response(
                    '#EXTM3U\n#EXTINF:1.0,\nlive_private_secret-0.ts\n',
                    {
                        headers: {
                            'content-type': 'application/vnd.apple.mpegurl',
                        },
                    },
                ),
            )
            .mockResolvedValueOnce(
                new Response(Buffer.from('segment'), {
                    headers: { 'content-type': 'video/mp2t' },
                }),
            );
        global.fetch = fetchMock;

        const result = await service.getHlsAsset(
            10,
            '91e3c06262f1c625aeb65008f0847e4e',
        );

        expect(fetchMock).toHaveBeenNthCalledWith(
            1,
            'http://srs:8080/live/live_private_secret.m3u8',
        );
        expect(fetchMock).toHaveBeenNthCalledWith(
            2,
            'http://srs:8080/live/live_private_secret-0.ts',
        );
        expect(result.body).toEqual(Buffer.from('segment'));
        expect(redis.set).toHaveBeenCalledWith(
            'stream:hls:10:91e3c06262f1c625aeb65008f0847e4e',
            'live_private_secret-0.ts',
            300,
        );
    });

    it('proxies SRS variant playlists that include hls_ctx query params', async () => {
        repository.findActiveStreamById.mockResolvedValue({
            id: 10,
            isLive: true,
            streamer: { streamKey: 'live_private_secret' },
        });
        redis.get.mockResolvedValue('live_private_secret.m3u8?hls_ctx=abc123');
        const fetchMock: jest.MockedFunction<typeof fetch> = jest
            .fn()
            .mockResolvedValue(
                new Response(
                    '#EXTM3U\n#EXTINF:1.0,\nlive_private_secret-0.ts\n',
                    {
                        headers: {
                            'content-type': 'application/vnd.apple.mpegurl',
                        },
                    },
                ),
            );
        global.fetch = fetchMock;

        const result = await service.getHlsAsset(10, 'variant-token');

        expect(fetchMock).toHaveBeenCalledWith(
            'http://srs:8080/live/live_private_secret.m3u8?hls_ctx=abc123',
        );
        expect(result.contentType).toBe('application/vnd.apple.mpegurl');
        expect(result.body).not.toContain('live_private_secret');
        expect(redis.set).toHaveBeenCalledWith(
            expect.stringMatching(/^stream:hls:10:/),
            'live_private_secret-0.ts',
            300,
        );
    });
});
