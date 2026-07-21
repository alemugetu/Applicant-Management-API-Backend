import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateNotesDto } from './dto/update-notes.dto';
import { QueryApplicantDto } from './dto/query-applicant.dto';
import { Prisma, Status } from '@prisma/client';

@Injectable()
export class ApplicantsService {
    constructor(private prisma: PrismaService) { }

    // 1. Create Applicant
    async create(createApplicantDto: CreateApplicantDto) {
        const existing = await this.prisma.applicant.findFirst({
            where: { email: createApplicantDto.email },
        });

        if (existing) {
            throw new ConflictException('An applicant with this email address already exists.');
        }

        return this.prisma.applicant.create({
            data: createApplicantDto,
        });
    }

    // 2. Paginated List with Search & Filters (Excludes Soft-deleted records)
    async findAll(query: QueryApplicantDto) {
        const { page = 1, limit = 10, search, status, track, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        const skip = (page - 1) * limit;

        // Build Prisma `where` criteria dynamically
        const where: Prisma.ApplicantWhereInput = {
            deletedAt: null, // Critical: Enforces soft-delete constraint
        };

        if (status) where.status = status;
        if (track) where.track = track;

        if (search) {
            where.OR = [
                { fullName: { contains: search } },
                { email: { contains: search } },
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.applicant.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            this.prisma.applicant.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: items,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    // 3. Find One Single Active Applicant
    async findOne(id: string) {
        const applicant = await this.prisma.applicant.findFirst({
            where: { id, deletedAt: null },
        });

        if (!applicant) {
            throw new NotFoundException(`Applicant with ID "${id}" was not found.`);
        }

        return applicant;
    }

    // 4. Update Details
    async update(id: string, updateApplicantDto: UpdateApplicantDto) {
        await this.findOne(id); // Ensures record exists and is active

        if (updateApplicantDto.email) {
            const existingEmail = await this.prisma.applicant.findFirst({
                where: {
                    email: updateApplicantDto.email,
                    NOT: { id },
                },
            });

            if (existingEmail) {
                throw new ConflictException('Email address is already in use by another applicant.');
            }
        }

        return this.prisma.applicant.update({
            where: { id },
            data: updateApplicantDto,
        });
    }

    // 5. Update Status with State Transition Constraint
    async updateStatus(id: string, updateStatusDto: UpdateStatusDto) {
        const applicant = await this.findOne(id);

        // Business Rule Constraint: REJECTED -> ACCEPTED is Forbidden
        if (applicant.status === Status.REJECTED && updateStatusDto.status === Status.ACCEPTED) {
            throw new BadRequestException('Business Rule Violation: An applicant cannot move directly from REJECTED to ACCEPTED.');
        }

        return this.prisma.applicant.update({
            where: { id },
            data: { status: updateStatusDto.status },
        });
    }

    // 6. Update Notes
    async updateNotes(id: string, updateNotesDto: UpdateNotesDto) {
        await this.findOne(id);

        return this.prisma.applicant.update({
            where: { id },
            data: { notes: updateNotesDto.notes },
        });
    }

    // 7. Soft Delete Applicant
    async softDelete(id: string) {
        await this.findOne(id);

        return this.prisma.applicant.update({
            where: { id },
            data: { deletedAt: new Date() }, // Soft delete by stamping execution time
        });
    }
}

