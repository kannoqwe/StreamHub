import { Transform } from 'class-transformer';
import {
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

const trim = (value: unknown): unknown =>
    typeof value === 'string' ? value.trim() : value;

const trimLower = (value: unknown): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : value;

export class UpdateProfileDto {
    @IsOptional()
    @Transform(({ value }) => trimLower(value))
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    @Matches(/^[a-z0-9_]+$/)
    username?: string;

    @IsOptional()
    @Transform(({ value }) => trim(value))
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    displayName?: string;

    @IsOptional()
    @Transform(({ value }) => trim(value))
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    bio?: string;
}
