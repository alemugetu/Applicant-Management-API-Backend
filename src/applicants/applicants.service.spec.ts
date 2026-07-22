import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantsService } from './applicants.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Status, Track } from '@prisma/client';

describe('ApplicantsService', () => {
  let service: ApplicantsService;

  const mockPrismaService = {
    applicant: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicantsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ApplicantsService>(ApplicantsService);
    jest.clearAllMocks();
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create an applicant when email is unique', async () => {
      mockPrismaService.applicant.findFirst.mockResolvedValue(null);
      mockPrismaService.applicant.create.mockResolvedValue({
        id: 'new-uuid',
        fullName: 'Test User',
        email: 'test@example.com',
        track: Track.BACKEND,
        status: Status.PENDING,
      });

      const result = await service.create({
        fullName: 'Test User',
        email: 'test@example.com',
        track: Track.BACKEND,
      });

      expect(result.email).toBe('test@example.com');
      expect(mockPrismaService.applicant.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrismaService.applicant.findFirst.mockResolvedValue({
        id: 'existing-uuid',
        email: 'duplicate@example.com',
      });

      await expect(
        service.create({
          fullName: 'Another User',
          email: 'duplicate@example.com',
          track: Track.FRONTEND,
        }),
      ).rejects.toThrow(ConflictException);

      expect(mockPrismaService.applicant.create).not.toHaveBeenCalled();
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return an active applicant', async () => {
      const applicant = {
        id: 'app-uuid',
        fullName: 'Active User',
        deletedAt: null,
      };
      mockPrismaService.applicant.findFirst.mockResolvedValue(applicant);

      const result = await service.findOne('app-uuid');
      expect(result.id).toBe('app-uuid');
    });

    it('should throw NotFoundException for a soft-deleted applicant', async () => {
      // findFirst returns null when deletedAt filter excludes the record
      mockPrismaService.applicant.findFirst.mockResolvedValue(null);

      await expect(service.findOne('deleted-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for a non-existent ID', async () => {
      mockPrismaService.applicant.findFirst.mockResolvedValue(null);

      await expect(service.findOne('ghost-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── updateStatus ───────────────────────────────────────────────────────────

  describe('updateStatus — status transition rules', () => {
    it('should prevent transitioning directly from REJECTED to ACCEPTED', async () => {
      mockPrismaService.applicant.findFirst.mockResolvedValue({
        id: 'app-uuid',
        status: Status.REJECTED,
        deletedAt: null,
      });

      await expect(
        service.updateStatus('app-uuid', { status: Status.ACCEPTED }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.applicant.update).not.toHaveBeenCalled();
    });

    it('should allow valid status transitions', async () => {
      mockPrismaService.applicant.findFirst.mockResolvedValue({
        id: 'app-uuid',
        status: Status.PENDING,
        deletedAt: null,
      });
      mockPrismaService.applicant.update.mockResolvedValue({
        id: 'app-uuid',
        status: Status.SHORTLISTED,
      });

      const result = await service.updateStatus('app-uuid', {
        status: Status.SHORTLISTED,
      });
      expect(result.status).toBe(Status.SHORTLISTED);
    });
  });

  // ── softDelete ─────────────────────────────────────────────────────────────

  describe('softDelete', () => {
    it('should stamp deletedAt on the applicant record', async () => {
      mockPrismaService.applicant.findFirst.mockResolvedValue({
        id: 'app-uuid',
        deletedAt: null,
      });
      mockPrismaService.applicant.update.mockResolvedValue({
        id: 'app-uuid',
        deletedAt: new Date(),
      });

      const result = await service.softDelete('app-uuid');
      expect(result.deletedAt).not.toBeNull();
      expect(mockPrismaService.applicant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'app-uuid' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('should throw NotFoundException when trying to delete a non-existent applicant', async () => {
      mockPrismaService.applicant.findFirst.mockResolvedValue(null);

      await expect(service.softDelete('ghost-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
