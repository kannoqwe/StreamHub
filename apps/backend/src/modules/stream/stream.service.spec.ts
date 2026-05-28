import { StreamService } from './stream.service';

describe('StreamService HLS proxy', () => {
    const lifecycle = {};
    const page = {};
    const feed = {};
    const repository = {
        findActiveStreamById: jest.fn(),
    };
    const config = {
        get: jest.fn((key: string) => {
            if (key === 'srs.hlsBaseUrl') return 'http://srs:8080';
            if (key === 'srs.hlsPath') return '/hls';
            return undefined;
        }),
    };
    const redis = {
        set: jest.fn(),
        get: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('proxies playlists through opaque segment tokens', async () => {
        repository.findActiveStreamById.mockResolvedValue({
            id: 10,
            isLive: true,
            streamer: { streamKey: 'live_private_secret' },
        });
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            text: () =>
                Promise.resolve(
                    '#EXTM3U\n#EXTINF:1.0,\nlive_private_secret-0.ts\n',
                ),
            headers: new Headers({
                'content-type': 'application/vnd.apple.mpegurl',
            }),
        }) as never;

        const service = new StreamService(
            lifecycle as never,
            page as never,
            feed as never,
            repository as never,
            config as never,
            redis as never,
        );

        const result = await service.getHlsAsset(10, 'index.m3u8');

        expect(fetch).toHaveBeenCalledWith(
            'http://srs:8080/hls/live_private_secret.m3u8',
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

        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                text: () =>
                    Promise.resolve(
                        '#EXTM3U\n#EXTINF:1.0,\nlive_private_secret-0.ts\n',
                    ),
                headers: new Headers({
                    'content-type': 'application/vnd.apple.mpegurl',
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                arrayBuffer: () => Promise.resolve(Buffer.from('segment')),
                headers: new Headers({ 'content-type': 'video/mp2t' }),
            }) as never;

        const service = new StreamService(
            lifecycle as never,
            page as never,
            feed as never,
            repository as never,
            config as never,
            redis as never,
        );

        const result = await service.getHlsAsset(
            10,
            '91e3c06262f1c625aeb65008f0847e4e',
        );

        expect(fetch).toHaveBeenNthCalledWith(
            1,
            'http://srs:8080/hls/live_private_secret.m3u8',
        );
        expect(fetch).toHaveBeenNthCalledWith(
            2,
            'http://srs:8080/hls/live_private_secret-0.ts',
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
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            text: () =>
                Promise.resolve(
                    '#EXTM3U\n#EXTINF:1.0,\nlive_private_secret-0.ts\n',
                ),
            headers: new Headers({
                'content-type': 'application/vnd.apple.mpegurl',
            }),
        }) as never;

        const service = new StreamService(
            lifecycle as never,
            page as never,
            feed as never,
            repository as never,
            config as never,
            redis as never,
        );

        const result = await service.getHlsAsset(10, 'variant-token');

        expect(fetch).toHaveBeenCalledWith(
            'http://srs:8080/hls/live_private_secret.m3u8?hls_ctx=abc123',
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
