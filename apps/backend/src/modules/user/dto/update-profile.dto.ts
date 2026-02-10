import { Transform } from 'class-transformer';
import {
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    @Matches(/^[a-z0-9_]+$/)
    username?: string;

    @IsOptional()
    @Transform(({ value }) => value?.trim())
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    displayName?: string;

    @IsOptional()
    @Transform(({ value }) => value?.trim())
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    bio?: string;
}
