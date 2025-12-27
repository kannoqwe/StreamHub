import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '@modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { compare, encrypt } from '@common/utils/encryption';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@/types';
import { StreamService } from '@modules/stream/stream.service';
import { UserProfile } from '@streamhub/shared';
import { Mapper } from '@common/utils/Mapper';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private streamService: StreamService,
    ) {}

    async login(username: string, password: string) {
        const userEntity = await this.validateUser(username, password);

        const user = Mapper.mapToUserProfile(userEntity);

        const payload: JwtPayload = { userId: user.id, username };
        const tokens = await this.generateTokens(payload);

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
            username: data.username,
            email: data.email,
            password: hashedPassword,
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

            await this.usersService.updateUser(payload.userId, {
                refreshToken: null,
            });
        } catch {
            return;
        }
    }

    async refreshToken(oldToken: string) {
        let payload: JwtPayload;
        try {
            payload = await this.jwtService.verifyAsync(oldToken, {
                secret: this.configService.get<string>('jwt.refreshSecret'),
            });
        } catch {
            throw new UnauthorizedException('Refresh Token expired');
        }

        const user = await this.usersService.findById(payload.userId);
        if (!user || !user.refreshToken)
            throw new UnauthorizedException('User not logged in');

        const isMatch = await compare(oldToken, user.refreshToken);
        if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

        const tokens = await this.generateTokens(payload);
        const hashedToken = await encrypt(tokens.refreshToken);

        await this.usersService.updateUser(user.id, {
            refreshToken: hashedToken,
        });
        return tokens;
    }

    async validateUser(username: string, password: string) {
        const user = await this.usersService.findByUsername(username);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await compare(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

    async generateTokens(payload: JwtPayload) {
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('jwt.accessSecret'),
            expiresIn: this.configService.get('jwt.accessExpiration'),
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('jwt.refreshSecret'),
            expiresIn: this.configService.get('jwt.refreshExpiration'),
        });

        return {
            accessToken,
            refreshToken,
        };
    }
}
