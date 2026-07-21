import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Track } from '@prisma/client';

export class CreateApplicantDto {
    @ApiProperty({ example: 'Kassahun Bekele', description: 'Full name of applicant' })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({ example: 'kassahun@example.com', description: 'Unique email address' })
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty()
    email: string;

    @ApiProperty({ enum: Track, example: Track.BACKEND, description: 'Internship track applied for' })
    @IsEnum(Track, { message: 'Invalid track selection' })
    @IsNotEmpty()
    track: Track;

    @ApiPropertyOptional({ example: 'Solid background in Django and Node.js.', description: 'Initial notes (max 1000 characters)' })
    @IsString()
    @IsOptional()
    @MaxLength(1000, { message: 'Notes cannot exceed 1000 characters' })
    notes?: string;
}

