import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
    ) {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET environment variable is not set.');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
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
