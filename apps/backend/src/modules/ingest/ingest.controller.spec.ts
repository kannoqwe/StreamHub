import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IngestController } from './ingest.controller';

describe('IngestController', () => {
    const streamService = {
        startStream: jest.fn(),
        endStream: jest.fn(),
    };

    const configService = {
        get: jest.fn(),
    } as unknown as ConfigService;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rejects publish hooks with an invalid secret', async () => {
        jest.spyOn(configService, 'get').mockReturnValue('expected-secret');
        const controller = new IngestController(
            streamService as never,
            configService,
        );

        await expect(
            controller.onPublish(
                { stream: 'live_key' },
                undefined,
                'bad-secret',
            ),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(streamService.startStream).not.toHaveBeenCalled();
    });

    it('accepts publish hooks with a valid secret', async () => {
        jest.spyOn(configService, 'get').mockReturnValue('expected-secret');
        const controller = new IngestController(
            streamService as never,
            configService,
        );

        await expect(
            controller.onPublish(
                { stream: 'live_key' },
                undefined,
                'expected-secret',
            ),
        ).resolves.toEqual({ code: 0, message: 'Stream started' });
        expect(streamService.startStream).toHaveBeenCalledWith('live_key');
    });
});
