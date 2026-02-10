import { Module } from '@nestjs/common';
import { StreamController } from '@modules/stream/stream.controller';
import { StreamService } from '@modules/stream/stream.service';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { UserModule } from '@modules/user/user.module';
import { StreamRepository } from '@modules/stream/stream.repository';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@modules/redis/redis.module';
import { CategoryService } from '@modules/stream/services/category.service';
import { StreamLifecycleService } from '@modules/stream/services/lifecycle.service';
import { StreamPageService } from '@modules/stream/services/page.service';
import { StreamFeedService } from '@modules/stream/services/feed.service';

@Module({
    imports: [PrismaModule, UserModule, JwtModule, RedisModule],
    providers: [
        StreamService,
        StreamRepository,
        CategoryService,
        StreamLifecycleService,
        StreamPageService,
        StreamFeedService,
    ],
    controllers: [StreamController],
    exports: [StreamService, StreamRepository],
})
export class StreamModule {}
