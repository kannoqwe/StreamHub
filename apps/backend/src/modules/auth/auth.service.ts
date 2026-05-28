import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '@modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { compare, encrypt } from '@common/utils/encryption';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@/types';
import { StreamService } from '@modules/stream/stream.service';
import { Mapper } from '@common/utils/Mapper';
import { randomUUID } from 'crypto';
import { RedisService } from '@modules/redis/redis.service';
import { AuthKeys } from '@common/constants/redis.keys';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private streamService: StreamService,
        private redisService: RedisService,
    ) {}

    async login(username: string, password: string) {
        const userEntity = await this.validateUser(username, password);

        const user = Mapper.mapToUserProfile(userEntity);

        const payload: JwtPayload = {
            userId: user.id,
            username: user.username,
        };
        const tokens = {
            accessToken: await this.generateAccessToken(payload),
            refreshToken: await this.generateRefreshToken(payload),
        };

        return { tokens, user };
    }

    async register(data: RegisterDto) {
        const existingUser = await this.usersService.findByUsername(
            data.username,
        );
        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        const hashedPassword = await encrypt(data.password);
        const streamKey = this.streamService.generateKey();

        const user = await this.usersService.createUser({
            username: data.username.toLowerCase(),
            email: data.email,
            password: hashedPassword,
            displayName: data.username,
            bio: this.usersService.generateDefaultBio(),
            avatarUrl: this.usersService.generateDefaultAvatarUrl(),
            streamKey,
        });

        return {
            id: user.id,
            username: user.username,
            email: user.email,
        };
    }

    async logout(refreshToken: string) {
        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(
                refreshToken,
                {
                    secret: this.configService.get('jwt.refreshSecret'),
                },
            );
            await this.revokeRefreshToken(payload);
        } catch {
            return;
        }
    }

    async refreshToken(oldToken: string) {
        let payload: JwtPayload;
        try {
            payload = await this.jwtService.verifyAsync<JwtPayload>(oldToken, {
                secret: this.configService.get<string>('jwt.refreshSecret'),
            });
        } catch {
            throw new UnauthorizedException('Refresh Token expired');
        }

        if (payload.jti && (await this.isRefreshTokenRevoked(payload.jti))) {
            throw new UnauthorizedException('Refresh Token revoked');
        }

        const user = await this.usersService.findById(payload.userId);
        if (!user) {
            throw new UnauthorizedException('User not logged in');
        }

        const accessPayload: JwtPayload = {
            userId: user.id,
            username: user.username,
        };

        return this.generateAccessToken(accessPayload);
    }

    async getMe(userId: number) {
        const userEntity = await this.usersService.findById(userId);
        if (!userEntity) throw new NotFoundException('User not found');

        return Mapper.mapToUserProfile(userEntity);
    }

    async validateUser(username: string, password: string) {
        const normalizedUsername = username.trim().toLowerCase();
        const user = await this.usersService.findByUsername(normalizedUsername);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await compare(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

    async generateAccessToken(payload: JwtPayload) {
        return this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('jwt.accessSecret'),
            expiresIn: this.configService.get('jwt.accessExpiration'),
        });
    }

    async generateRefreshToken(payload: JwtPayload) {
        return this.jwtService.signAsync(
            {
                ...payload,
                jti: randomUUID(),
            },
            {
                secret: this.configService.get<string>('jwt.refreshSecret'),
                expiresIn: this.configService.get('jwt.refreshExpiration'),
            },
        );
    }

    private async revokeRefreshToken(payload: JwtPayload): Promise<void> {
        if (!payload.jti || !payload.exp) return;

        const ttl = payload.exp - Math.floor(Date.now() / 1000);
        if (ttl <= 0) return;

        await this.redisService.set(
            AuthKeys.revokedRefresh(payload.jti),
            true,
            ttl,
        );
    }

    private async isRefreshTokenRevoked(jti: string): Promise<boolean> {
        return (
            (await this.redisService.get<boolean>(
                AuthKeys.revokedRefresh(jti),
            )) === true
        );
    }
}
