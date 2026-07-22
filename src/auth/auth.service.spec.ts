import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    admin: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('signed-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return access_token and admin info on valid credentials', async () => {
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);
    mockPrismaService.admin.findUnique.mockResolvedValue({
      id: 'admin-uuid',
      email: 'admin@infnova.tech',
      name: 'System Admin',
      password: hashedPassword,
    });

    const result = await service.login({
      email: 'admin@infnova.tech',
      password: 'Admin@123456',
    });

    expect(result.access_token).toBe('signed-token');
    expect(result.admin.email).toBe('admin@infnova.tech');
    // Password must never be returned
    expect(result.admin).not.toHaveProperty('password');
  });

  it('should throw UnauthorizedException when admin email does not exist', async () => {
    mockPrismaService.admin.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'unknown@example.com', password: 'anything' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password is wrong', async () => {
    const hashedPassword = await bcrypt.hash('correctPassword', 10);
    mockPrismaService.admin.findUnique.mockResolvedValue({
      id: 'admin-uuid',
      email: 'admin@infnova.tech',
      name: 'System Admin',
      password: hashedPassword,
    });

    await expect(
      service.login({ email: 'admin@infnova.tech', password: 'wrongPassword' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
