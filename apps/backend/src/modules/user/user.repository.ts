import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { User } from '@generated/client';
import { UserCreateInput, UserUpdateInput } from '@generated/models/User';

@Injectable()
export class UserRepository {
    constructor(private prismaService: PrismaService) {}

    async findByUsername(username: string): Promise<User | null> {
        return this.prismaService.user.findUnique({ where: { username } });
    }

    async findById(id: number): Promise<User | null> {
        return this.prismaService.user.findUnique({ where: { id } });
    }

    async findByStreamKey(streamKey: string): Promise<User | null> {
        return this.prismaService.user.findUnique({ where: { streamKey } });
    }

    async create(data: UserCreateInput): Promise<User> {
        return this.prismaService.user.create({ data });
    }

    async update(userId: number, data: UserUpdateInput): Promise<User> {
        return this.prismaService.user.update({ where: { id: userId }, data });
    }
}
