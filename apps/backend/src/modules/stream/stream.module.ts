import { Module } from '@nestjs/common';
import { StreamController } from '@modules/stream/stream.controller';
import { StreamService } from '@modules/stream/stream.service';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { UserModule } from '@modules/user/user.module';
import { StreamRepository } from '@modules/stream/stream.repository';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@modules/redis/redis.module';
import { StreamCategoryService } from '@modules/stream/services/stream-category.service';

@Module({
    imports: [PrismaModule, UserModule, JwtModule, RedisModule],
    providers: [StreamService, StreamRepository, StreamCategoryService],
    controllers: [StreamController],
    exports: [StreamService, StreamRepository],
})
export class StreamModule {}
