import { IsString, IsOptional, IsNumber } from 'class-validator';

export class RtmpEventDto {
    @IsString()
    @IsOptional()
    app: string;

    @IsString()
    @IsOptional()
    flashver: string;

    @IsString()
    @IsOptional()
    swfurl: string;

    @IsString()
    @IsOptional()
    tcurl: string;

    @IsString()
    @IsOptional()
    pageurl: string;

    @IsString()
    @IsOptional()
    addr: string;

    @IsString()
    @IsOptional()
    clientid: string;

    @IsString()
    @IsOptional()
    call: string;

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    type: string;
}

export class StartSreamDto {
    @IsString()
    title: string;

    @IsNumber()
    categoryId: number;
}
