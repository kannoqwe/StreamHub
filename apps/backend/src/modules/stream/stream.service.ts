import {
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { StreamRepository } from '@modules/stream/stream.repository';
import { StreamSession } from '@generated/client';
import { UserService } from '@modules/user/user.service';
import { ONE_HOUR_MS, validateCooldown } from '@common/utils/time';
import { StreamModel } from '@streamhub/shared';
import { Mapper } from '@common/utils/Mapper';

@Injectable()
export class StreamService {
    constructor(
        private streamRepository: StreamRepository,
        private userService: UserService,
    ) {}

    generateKey() {
        return `live_${randomBytes(16).toString('hex')}`;
    }

    async startStream(streamKey: string): Promise<StreamSession | null> {
        const user = await this.userService.findByStreamKey(streamKey);
        if (!user) throw new ForbiddenException('Invalid stream key');

        // ensure user active stream
        await this.streamRepository.end(user.id);

        return this.streamRepository.start(user.id, {
            title: 'Untitled Stream',
            categoryId: 1,
        });
    }

    async endStream(streamKey: string) {
        const user = await this.userService.findByStreamKey(streamKey);
        if (!user) throw new ForbiddenException('Invalid stream key');

        return this.streamRepository.end(user.id);
    }

    async getActiveStream(username: string): Promise<StreamModel | null> {
        const stream =
            await this.streamRepository.findStreamByUsername(username);
        if (!stream) return null;

        return Mapper.mapToStream(stream, stream.streamer);
    }

    async regenerateStreamKey(userId: number) {
        const user = await this.userService.findById(userId);
        if (!user) throw new UnauthorizedException('User not logged in');

        validateCooldown(user.streamKeyLastRegenerated, ONE_HOUR_MS);

        const newKey = this.generateKey();

        await this.userService.updateUser(userId, {
            streamKey: newKey,
            streamKeyLastRegenerated: new Date(),
        });

        return {
            streamKey: newKey,
        };
    }
}
