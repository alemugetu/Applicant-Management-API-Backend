import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'superSecretKey123',
        });
    }

    // Whatever this method returns gets attached to `req.user`
    async validate(payload: { sub: string; email: string }) {
        const admin = await this.prisma.admin.findUnique({
            where: { id: payload.sub },
        });

        if (!admin) {
            throw new UnauthorizedException('Admin user no longer exists.');
        }

        // Exclude password from request context
        const { password, ...result } = admin;
        return result;
    }
}
