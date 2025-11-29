import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
    @IsString()
    @MinLength(3, { message: 'Username must be at least 3 characters' })
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers and underscores',
    })
    username: string;

    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain uppercase, lowercase and number',
    })
    password: string;
}
