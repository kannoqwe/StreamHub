import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { UserService } from '@modules/user/user.service';
import { FollowService } from '@modules/follow/follow.service';
import { JwtGuard } from '@common/guards/jwt.guard';
import { Request } from 'express';
import type { UserModel } from '@streamhub/shared';
import { Mapper } from '@common/utils/Mapper';
import { UpdateProfileDto } from '@modules/user/dto/update-profile.dto';

@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
        private followService: FollowService,
    ) {}

    @UseGuards(JwtGuard)
    @Get('follow/:followingId')
    @HttpCode(HttpStatus.OK)
    async followStatus(
        @Req() req: Request,
        @Param('followingId', ParseIntPipe) followingId: number,
    ) {
        return this.followService.status(req.user.userId, followingId);
    }

    @UseGuards(JwtGuard)
    @Post('follow/:followingId')
    @HttpCode(HttpStatus.OK)
    async follow(
        @Req() req: Request,
        @Param('followingId', ParseIntPipe) followingId: number,
    ) {
        return this.followService.follow(req.user.userId, followingId);
    }

    @UseGuards(JwtGuard)
    @Delete('follow/:followingId')
    @HttpCode(HttpStatus.OK)
    async unfollow(
        @Req() req: Request,
        @Param('followingId', ParseIntPipe) followingId: number,
    ) {
        return this.followService.unfollow(req.user.userId, followingId);
    }

    @UseGuards(JwtGuard)
    @Post('profile')
    @HttpCode(HttpStatus.OK)
    async updateProfile(
        @Req() req: Request,
        @Body() updateProfileDto: UpdateProfileDto,
    ): Promise<UserModel> {
        const user = await this.userService.updateProfile(
            req.user.userId,
            updateProfileDto,
        );
        return Mapper.mapToUserProfile(user);
    }
}
