import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Status, Track } from '@prisma/client';

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class QueryApplicantDto {
    @ApiPropertyOptional({ default: 1, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({ default: 10, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Search term for name or email' })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ enum: Status })
    @IsEnum(Status)
    @IsOptional()
    status?: Status;

    @ApiPropertyOptional({ enum: Track })
    @IsEnum(Track)
    @IsOptional()
    track?: Track;

    @ApiPropertyOptional({ example: 'createdAt', description: 'Field to sort by' })
    @IsString()
    @IsOptional()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
    @IsEnum(SortOrder)
    @IsOptional()
    sortOrder?: SortOrder = SortOrder.DESC;
}

