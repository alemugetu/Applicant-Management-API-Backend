import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotesDto {
    @ApiPropertyOptional({
        example: 'Demonstrated strong problem-solving skills during practical test.',
        maxLength: 1000,
        description: 'Internal notes for this applicant. Send an empty string or omit to clear.',
    })
    @IsString()
    @IsOptional()
    @MaxLength(1000, { message: 'Notes must not exceed 1,000 characters' })
    notes?: string;
}
