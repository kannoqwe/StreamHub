import {
    BadGatewayException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { StreamSession } from '@generated/client';
import type {
    StreamModel,
    ChannelDto,
    StreamKeyResponse,
} from '@streamhub/shared';
import {
    HomeFeedResponse,
    PublicCategoryResponse,
    PublicStreamCardResponse,
} from '@modules/stream/types/response.interface';
import { StreamLifecycleService } from '@modules/stream/services/lifecycle.service';
import { StreamPageService } from '@modules/stream/services/page.service';
import { StreamFeedService } from '@modules/stream/services/feed.service';
import { StreamRepository } from '@modules/stream/stream.repository';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@modules/redis/redis.service';
import { createHash } from 'crypto';

@Injectable()
export class StreamService {
    constructor(
        private readonly streamLifecycleService: StreamLifecycleService,
        private readonly streamPageService: StreamPageService,
        private readonly streamFeedService: StreamFeedService,
        private readonly streamRepository: StreamRepository,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
    ) {}

    generateKey(): string {
        return this.streamLifecycleService.generateKey();
    }

    async startStream(streamKey: string): Promise<StreamSession | null> {
        return this.streamLifecycleService.startStream(streamKey);
    }

    async endStream(streamKey: string): Promise<void> {
        return this.streamLifecycleService.endStream(streamKey);
    }

    async getActiveStream(username: string): Promise<StreamModel | null> {
        return this.streamPageService.getActiveStream(username);
    }

    async getStreamPage(
        username: string,
        requesterUserId?: number,
    ): Promise<ChannelDto> {
        void requesterUserId;
        return this.streamPageService.getStreamPage(username);
    }

    async regenerateStreamKey(userId: number): Promise<StreamKeyResponse> {
        return this.streamLifecycleService.regenerateStreamKey(userId);
    }

    async getCurrentStreamKey(userId: number): Promise<StreamKeyResponse> {
        return this.streamLifecycleService.getCurrentStreamKey(userId);
    }

    async getLiveStreams(limit: number): Promise<PublicStreamCardResponse[]> {
        return this.streamFeedService.getLiveStreams(limit);
    }

    async getFollowedLiveStreams(
        userId: number,
        limit: number,
    ): Promise<PublicStreamCardResponse[]> {
        return this.streamFeedService.getFollowedLiveStreams(userId, limit);
    }

    async getCategories(): Promise<PublicCategoryResponse[]> {
        return this.streamFeedService.getCategories();
    }

    async getHomeFeed(limit: number): Promise<HomeFeedResponse> {
        return this.streamFeedService.getHomeFeed(limit);
    }

    async getHlsAsset(
        playbackId: number,
        file: string,
    ): Promise<{
        body: string | Buffer;
        contentType: string;
        cacheControl: string;
    }> {
        const stream =
            await this.streamRepository.findActiveStreamById(playbackId);
        if (!stream) throw new NotFoundException('Stream not found');

        const baseUrl = this.configService.get<string>('srs.hlsBaseUrl')!;
        const hlsPath = this.configService.get<string>('srs.hlsPath')!;
        const normalizedPath = hlsPath.startsWith('/')
            ? hlsPath
            : `/${hlsPath}`;
        const upstreamFile =
            file === 'index.m3u8'
                ? `${stream.streamer.streamKey}.m3u8`
                : await this.resolveHlsAsset(
                      playbackId,
                      file,
                      stream.streamer.streamKey,
                      `${baseUrl}${normalizedPath}`,
                  );
        const upstreamUrl = this.buildHlsUrl(
            baseUrl,
            normalizedPath,
            upstreamFile,
        );
        const isPlaylist =
            file.endsWith('.m3u8') ||
            upstreamFile.split('?')[0].endsWith('.m3u8');

        const upstream = await fetch(upstreamUrl);
        if (!upstream.ok) {
            throw new BadGatewayException('HLS upstream unavailable');
        }

        if (isPlaylist) {
            const playlist = await upstream.text();
            return {
                body: await this.rewritePlaylist(playlist, playbackId),
                contentType: 'application/vnd.apple.mpegurl',
                cacheControl: 'no-store',
            };
        }

        const bytes = Buffer.from(await upstream.arrayBuffer());
        return {
            body: bytes,
            contentType: upstream.headers.get('content-type') ?? 'video/mp2t',
            cacheControl: 'public, max-age=10',
        };
    }

    private async rewritePlaylist(
        playlist: string,
        playbackId: number,
    ): Promise<string> {
        const lines = await Promise.all(
            playlist.split('\n').map(async (line) => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) return line;
                if (/^https?:\/\//i.test(trimmed)) return trimmed;

                const asset = trimmed.split('/').pop() ?? trimmed;
                const token = await this.storeHlsAsset(playbackId, asset);
                return token;
            }),
        );

        return lines.join('\n');
    }

    private async storeHlsAsset(
        playbackId: number,
        asset: string,
    ): Promise<string> {
        const token = this.buildHlsAssetToken(playbackId, asset);

        await this.redisService.set(
            `stream:hls:${playbackId}:${token}`,
            asset,
            300,
        );

        return token;
    }

    private async resolveHlsAsset(
        playbackId: number,
        token: string,
        streamKey: string,
        hlsBase: string,
    ): Promise<string> {
        const asset = await this.redisService.get<string>(
            `stream:hls:${playbackId}:${token}`,
        );
        if (asset && this.isSafeHlsAsset(asset)) {
            return asset;
        }

        const playlistUrl = `${hlsBase}/${encodeURIComponent(streamKey)}.m3u8`;
        const upstream = await fetch(playlistUrl);
        if (!upstream.ok) {
            throw new BadGatewayException('HLS upstream unavailable');
        }

        const playlist = await upstream.text();
        const candidate = playlist
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('#'))
            .map((line) => line.split('/').pop() ?? line)
            .find(
                (line) =>
                    this.isSafeHlsAsset(line) &&
                    this.buildHlsAssetToken(playbackId, line) === token,
            );

        if (!candidate) throw new NotFoundException('HLS asset not found');

        await this.redisService.set(
            `stream:hls:${playbackId}:${token}`,
            candidate,
            300,
        );

        return candidate;
    }

    private buildHlsAssetToken(playbackId: number, asset: string): string {
        return createHash('sha256')
            .update(`${playbackId}:${asset}`)
            .digest('hex')
            .slice(0, 32);
    }

    private isSafeHlsAsset(asset: string): boolean {
        return /^[a-zA-Z0-9_.-]+\.(m3u8|ts)(\?hls_ctx=[a-zA-Z0-9_-]+)?$/.test(
            asset,
        );
    }

    private buildHlsUrl(
        baseUrl: string,
        hlsPath: string,
        asset: string,
    ): string {
        const [filename, query] = asset.split('?');
        const url = `${baseUrl}${hlsPath}/${encodeURIComponent(filename)}`;
        return query ? `${url}?${query}` : url;
    }
}
