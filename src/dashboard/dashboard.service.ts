import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status, Track } from '@prisma/client';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getSummary() {
        // Shared clause to ignore soft-deleted records
        const activeCondition = { deletedAt: null };

        const totalApplicants = await this.prisma.applicant.count({
            where: activeCondition,
        });

        // Count applicants per status
        const statusCounts = await Promise.all(
            Object.values(Status).map(async (status) => {
                const count = await this.prisma.applicant.count({
                    where: { ...activeCondition, status },
                });
                return { status, count };
            }),
        );

        // Count applicants per track
        const trackCounts = await Promise.all(
            Object.values(Track).map(async (track) => {
                const count = await this.prisma.applicant.count({
                    where: { ...activeCondition, track },
                });
                return { track, count };
            }),
        );

        return {
            totalApplicants,
            byStatus: statusCounts.reduce((acc, curr) => ({ ...acc, [curr.status]: curr.count }), {}),
            byTrack: trackCounts.reduce((acc, curr) => ({ ...acc, [curr.track]: curr.count }), {}),
        };
    }
}

