import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantsService } from './applicants.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { Status, Track } from '@prisma/client';

describe('ApplicantsService Status Transition', () => {
  let service: ApplicantsService;

  const mockPrismaService = {
    applicant: {
      findFirst: jest.fn(),
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
  });

  it('should prevent transitioning directly from REJECTED to ACCEPTED', async () => {
    mockPrismaService.applicant.findFirst.mockResolvedValue({
      id: 'app-uuid',
      status: Status.REJECTED,
      deletedAt: null,
    });

    await expect(
      service.updateStatus('app-uuid', { status: Status.ACCEPTED }),
    ).rejects.toThrow(BadRequestException);
  });
});

