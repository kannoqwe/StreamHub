import { AuthService } from './auth.service';

describe('AuthService refresh revocation', () => {
    const users = {};
    const jwt = {
        verifyAsync: jest.fn(),
        signAsync: jest.fn(),
    };
    const config = {
        get: jest.fn((key: string) => {
            if (key === 'jwt.refreshSecret') return 'refresh-secret';
            return undefined;
        }),
    };
    const stream = {};
    const redis = {
        set: jest.fn(),
        get: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('stores a revoked refresh token until token expiry on logout', async () => {
        const exp = Math.floor(Date.now() / 1000) + 120;
        jwt.verifyAsync.mockResolvedValue({
            userId: 1,
            username: 'kanno',
            jti: 'refresh-id',
            exp,
        });

        const service = new AuthService(
            users as never,
            jwt as never,
            config as never,
            stream as never,
            redis as never,
        );

        await service.logout('refresh-token');

        expect(redis.set).toHaveBeenCalledWith(
            'auth:refresh:revoked:refresh-id',
            true,
            expect.any(Number),
        );
    });
});
