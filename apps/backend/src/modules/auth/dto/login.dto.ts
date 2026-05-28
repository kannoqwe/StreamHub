import { IsString, MinLength } from 'class-validator';
import type { LoginDto as LoginDtoBase } from '@streamhub/shared';

export class LoginDto implements LoginDtoBase {
    @IsString()
    @MinLength(3)
    username: string;

    @IsString()
    password: string;
}
