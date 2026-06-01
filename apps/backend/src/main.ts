import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { configureCors } from '@common/bootstrap/cors';
import { configureHttp } from '@common/bootstrap/http';
import { configureValidation } from '@common/bootstrap/validation';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get('PORT') as string;

    configureHttp(app);
    configureValidation(app);
    configureCors(app, configService);

    await app.listen(port);
}
void bootstrap();
