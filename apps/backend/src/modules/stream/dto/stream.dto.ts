import { IsString, IsOptional, IsNumber } from 'class-validator';

export class IngestDto {
    @IsString()
    @IsOptional()
    action?: string;

    @IsString()
    @IsOptional()
    client_id?: string;

    @IsString()
    @IsOptional()
    ip?: string;

    @IsString()
    @IsOptional()
    vhost?: string;

    @IsString()
    @IsOptional()
    app?: string;

    @IsString()
    stream: string;

    @IsString()
    @IsOptional()
    param?: string;
}

export class StartSreamDto {
    @IsString()
    title: string;

    @IsNumber()
    categoryId: number;
}
