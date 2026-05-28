import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { RegisterDto } from '@modules/auth/dto/register.dto';
import { JwtGuard } from '@common/guards/jwt.guard';
import { CookieOptions, Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import type {
    LoginResponse,
    LogoutResponse,
    RefreshResponse,
    RegisterResponse,
    UserModel,
} from '@streamhub/shared';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) {}

    private get cookieOptions() {
        return this.configService.get('cookies.refreshToken') as CookieOptions;
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<LoginResponse> {
        const response = await this.authService.login(
            loginDto.username,
            loginDto.password,
        );
        res.cookie(
            'refreshToken',
            response.tokens.refreshToken,
            this.cookieOptions,
        );

        return { token: response.tokens.accessToken, user: response.user };
    }

    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async register(
        @Body() registerDto: RegisterDto,
    ): Promise<RegisterResponse> {
        return this.authService.register(registerDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<LogoutResponse> {
        const refreshToken = req.cookies['refreshToken'] as string;
        if (refreshToken) await this.authService.logout(refreshToken);

        res.clearCookie('refreshToken', {
            path: this.cookieOptions.path,
        });

        return {
            success: true,
            message: 'Logged out successfully',
        };
    }

    @HttpCode(HttpStatus.OK)
    @Get('refresh')
    async refresh(@Req() req: Request): Promise<RefreshResponse> {
        const refreshCookie = req.cookies['refreshToken'] as string;
        if (!refreshCookie)
            throw new UnauthorizedException('Refresh Token expired');

        const token = await this.authService.refreshToken(refreshCookie);
        return { token };
    }

    @UseGuards(JwtGuard)
    @Get('me')
    async getStats(@Req() req: Request): Promise<UserModel> {
        return this.authService.getMe(req.user.userId);
    }
}
