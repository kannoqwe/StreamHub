import { Module } from '@nestjs/common';
import { StreamController } from '@modules/stream/stream.controller';
import { StreamService } from '@modules/stream/stream.service';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { UserModule } from '@modules/user/user.module';
import { StreamRepository } from '@modules/stream/stream.repository';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [PrismaModule, UserModule, JwtModule],
    providers: [StreamService, StreamRepository],
    controllers: [StreamController],
    exports: [StreamService, StreamRepository],
})
export class StreamModule {}
