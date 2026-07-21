import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async login(dto: LoginDto) {
        const admin = await this.prisma.admin.findUnique({
            where: { email: dto.email },
        });

        if (!admin) {
            throw new UnauthorizedException('Invalid email or password credentials.');
        }

        const passwordMatches = await bcrypt.compare(dto.password, admin.password);
        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid email or password credentials.');
        }

        const payload = { sub: admin.id, email: admin.email };

        return {
            access_token: await this.jwtService.signAsync(payload),
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
            },
        };
    }
}

