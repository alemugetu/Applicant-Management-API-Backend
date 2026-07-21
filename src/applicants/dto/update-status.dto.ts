import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class UpdateStatusDto {
    @ApiProperty({ enum: Status, example: Status.SHORTLISTED })
    @IsEnum(Status, { message: 'Invalid status value' })
    @IsNotEmpty()
    status: Status;
}

