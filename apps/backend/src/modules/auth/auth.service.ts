import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare, encrypt } from '@common/utils/encryption';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@/types';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async login(username: string, password: string) {
        const user = await this.validateUser(username, password);

        const payload: JwtPayload = { userId: user.id, username };

        return await this.generateTokens(payload);
    }

    async register(data: RegisterDto) {
        const existingUser = await this.usersService.findUserByUUID(
            data.username,
        );
        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        const hashedPassword = await encrypt(data.password);

        const user = await this.usersService.createUser({
            username: data.username,
            email: data.email,
            password: hashedPassword,
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPass } = user;
        return userWithoutPass;
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
                secret: this.configService.get<string>('jwt.accessSecret'),
            });
        } catch {
            throw new UnauthorizedException('Refresh Token expired');
        }

        const user = await this.usersService.findUserByUUID(payload.userId);
        if (!user || !user.refreshToken)
            throw new UnauthorizedException('User not logged in');

        const isMatch = await compare(oldToken, user.refreshToken);
        if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

        const tokens = await this.generateTokens(payload);
        const hashedToken = await encrypt(tokens.refresh_token);

        await this.usersService.updateUser(user.id, {
            refreshToken: hashedToken,
        });
        return tokens;
    }

    async validateUser(username: string, password: string) {
        const user = await this.usersService.findUserByUUID(username);
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
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
}
