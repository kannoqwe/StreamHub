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
import { JwtGuard } from '@modules/auth/jwt.guard';
import { CookieOptions, Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';

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
    ) {
        const tokens = await this.authService.login(
            loginDto.username,
            loginDto.password,
        );
        res.cookie('refreshToken', tokens.refresh_token, this.cookieOptions);

        return { access_token: tokens.access_token };
    }

    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies['refreshToken'] as string;
        if (refreshToken) await this.authService.logout(refreshToken);

        res.clearCookie('refreshToken');

        return {
            success: true,
            message: 'Logged out successfully',
        };
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshCookie = req.cookies['refreshToken'] as string;
        if (!refreshCookie)
            throw new UnauthorizedException('Refresh Token expired');

        const tokens = await this.authService.refreshToken(refreshCookie);
        res.cookie('refreshToken', tokens.refresh_token, this.cookieOptions);

        return { access_token: tokens.access_token };
    }

    @UseGuards(JwtGuard)
    @Get('stats')
    getStats(@Req() req: Request) {
        return {
            userId: req.user?.userId,
            username: req.user?.username,
        };
    }
}
