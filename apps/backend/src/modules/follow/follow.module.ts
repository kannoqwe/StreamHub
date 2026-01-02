import { Module } from '@nestjs/common';
import { FollowService } from '@modules/follow/follow.service';
import { FollowRepository } from '@modules/follow/follow.repository';

@Module({
    imports: [],
    providers: [FollowService, FollowRepository],
    exports: [FollowService, FollowRepository],
})
export class FollowModule {}
