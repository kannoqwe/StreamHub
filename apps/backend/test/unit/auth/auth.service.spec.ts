import { AuthService } from '@modules/auth/auth.service';
import { Test } from '@nestjs/testing';
import { UserService } from '@modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StreamService } from '@modules/stream/stream.service';
import { RedisService } from '@modules/redis/redis.service';

describe('AuthService refresh revocation', () => {
    let service: AuthService;

    type ConfigServiceMock = {
        get: jest.Mock<string | undefined, [string]>;
    };

    const jwt: jest.Mocked<Pick<JwtService, 'verifyAsync' | 'signAsync'>> = {
        verifyAsync: jest.fn(),
        signAsync: jest.fn(),
    };
    const config: ConfigServiceMock = {
        get: jest.fn((key: string) => {
            if (key === 'jwt.refreshSecret') return 'refresh-secret';
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
                AuthService,
                { provide: UserService, useValue: {} },
                { provide: JwtService, useValue: jwt },
                { provide: ConfigService, useValue: config },
                { provide: StreamService, useValue: {} },
                { provide: RedisService, useValue: redis },
            ],
        }).compile();

        service = moduleRef.get(AuthService);
    });

    it('stores a revoked refresh token until token expiry on logout', async () => {
        const exp = Math.floor(Date.now() / 1000) + 120;
        jwt.verifyAsync.mockResolvedValue({
            userId: 1,
            username: 'kanno',
            jti: 'refresh-id',
            exp,
        });

        await service.logout('refresh-token');

        expect(redis.set).toHaveBeenCalledWith(
            'auth:refresh:revoked:refresh-id',
            true,
            expect.any(Number),
        );
    });
});
