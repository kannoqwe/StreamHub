import {
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { UserRepository } from '@modules/user/user.repository';
import { StreamRepository } from '@modules/stream/stream.repository';
import { Stream } from '@generated/client';
import { UserService } from '@modules/user/user.service';
import { ONE_HOUR_MS, validateCooldown } from '@common/utils/time';

@Injectable()
export class StreamService {
    constructor(
        private userRepository: UserRepository,
        private streamRepository: StreamRepository,
        private userService: UserService,
    ) {}

    generateKey() {
        return `live_${randomBytes(16).toString('hex')}`;
    }

    async startStream(streamKey: string): Promise<Stream | null> {
        const user = await this.userRepository.findByStreamKey(streamKey);
        if (!user) throw new ForbiddenException('Invalid stream key');

        // ensure user active stream
        await this.streamRepository.endStream(user.id);

        return this.streamRepository.startStream(user.id);
    }

    async endStream(streamKey: string) {
        const user = await this.userRepository.findByStreamKey(streamKey);
        if (!user) throw new ForbiddenException('Invalid stream key');

        return this.streamRepository.endStream(user.id);
    }

    async regenerateStreamKey(userId: number) {
        const user = await this.userService.findUser(userId);
        if (!user) throw new UnauthorizedException('User not logged in');

        validateCooldown(user.streamKeyLastRegenerated, ONE_HOUR_MS);

        const newKey = this.generateKey();

        await this.userRepository.update(userId, {
            streamKey: newKey,
            streamKeyLastRegenerated: new Date(),
        });

        return newKey;
    }
}
