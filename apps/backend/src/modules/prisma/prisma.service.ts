import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@generated/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    onModuleInit() {
        Logger.log('Database initialized.', 'DATABASE');
    }
}
