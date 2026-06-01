import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { StreamService } from '@modules/stream/stream.service';
import { IngestController } from './ingest.controller';

describe('IngestController', () => {
    let controller: IngestController;

    const streamService: jest.Mocked<
        Pick<StreamService, 'startStream' | 'endStream'>
    > = {
        startStream: jest.fn(),
        endStream: jest.fn(),
    };

    const configService: jest.Mocked<Pick<ConfigService, 'get'>> = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const moduleRef = await Test.createTestingModule({
            controllers: [IngestController],
            providers: [
                { provide: StreamService, useValue: streamService },
                { provide: ConfigService, useValue: configService },
            ],
        }).compile();

        controller = moduleRef.get(IngestController);
    });

    it('rejects publish hooks with an invalid secret', async () => {
        jest.spyOn(configService, 'get').mockReturnValue('expected-secret');

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
