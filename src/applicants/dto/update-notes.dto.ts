import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotesDto {
    @ApiProperty({ example: 'Demonstrated strong problem-solving skills during practical test.', maxLength: 1000 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000, { message: 'Notes must not exceed 1,000 characters' })
    notes: string;
}
