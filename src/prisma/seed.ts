import { PrismaClient, Track, Status } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.applicant.deleteMany();
    await prisma.admin.deleteMany();

    // Create default Admin
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);
    const admin = await prisma.admin.create({
        data: {
            email: 'admin@infnova.tech',
            name: 'System Admin',
            password: hashedPassword,
        },
    });

    console.log(`Created admin user: ${admin.email}`);

    // Create Sample Applicants
    await prisma.applicant.createMany({
        data: [
            {
                fullName: 'Alemu Tesfaye',
                email: 'alemu@example.com',
                track: Track.BACKEND,
                status: Status.PENDING,
            },
            {
                fullName: 'Bethlehem Tadesse',
                email: 'betty@example.com',
                track: Track.FRONTEND,
                status: Status.SHORTLISTED,
                notes: 'Great portfolio project.',
            },
            {
                fullName: 'Chala Gemechu',
                email: 'chala@example.com',
                track: Track.UI_UX,
                status: Status.REJECTED,
            },
        ],
    });

    console.log('Seeded sample applicants.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


