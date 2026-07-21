import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'admin@infnova.tech', description: 'Admin email address' })
    @IsEmail({}, { message: 'Please enter a valid email address' })
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'Admin@123456', description: 'Admin password' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
}

