import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantsController } from './applicants.controller';
import { ApplicantsService } from './applicants.service';

describe('ApplicantsController', () => {
  let controller: ApplicantsController;

  const mockApplicantsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantsController],
      providers: [
        { provide: ApplicantsService, useValue: mockApplicantsService },
      ],
    }).compile();

    controller = module.get<ApplicantsController>(ApplicantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
