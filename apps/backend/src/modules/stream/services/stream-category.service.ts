import {
    Injectable,
    NotFoundException,
    OnApplicationBootstrap,
} from '@nestjs/common';
import { StreamRepository } from '@modules/stream/stream.repository';
import { DEFAULT_STREAM_CATEGORY_NAME } from '@modules/stream/constants/stream.constants';
import { TWITCH_DEFAULT_CATEGORIES } from '@modules/stream/constants/twitch-default-categories';
import { PublicCategoryResponse } from '@modules/stream/interfaces/response.interface';

@Injectable()
export class StreamCategoryService implements OnApplicationBootstrap {
    constructor(private readonly streamRepository: StreamRepository) {}

    async onApplicationBootstrap() {
        await this.ensureDefaultCategories();
    }

    async getDefaultCategoryId(): Promise<number> {
        const byName = await this.streamRepository.findCategoryByName(
            DEFAULT_STREAM_CATEGORY_NAME,
        );
        if (byName) return byName.id;

        const firstCategory = await this.streamRepository.findFirstCategory();
        if (firstCategory) return firstCategory.id;

        throw new NotFoundException('No categories configured');
    }

    async getPublicCategories(): Promise<PublicCategoryResponse[]> {
        const categories = await this.streamRepository.findCategories();
        return categories.map((category) => ({
            id: category.id,
            name: category.name,
            image: category.iconUrl,
        }));
    }

    private async ensureDefaultCategories(): Promise<void> {
        for (const category of TWITCH_DEFAULT_CATEGORIES) {
            await this.streamRepository.upsertCategory(
                category.name,
                category.iconUrl,
            );
        }
    }
}
