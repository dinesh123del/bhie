import { PrismaClient, Role, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  try {
    console.log("🌱 Seeding started...");

    // ✅ Admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@bhie.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@bhie.com',
        password: adminPassword,
        role: Role.ADMIN,
      },
    });

    // ✅ Staff user
    const staffPassword = await bcrypt.hash('staff123', 12);
    const staff = await prisma.user.upsert({
      where: { email: 'staff@bhie.com' },
      update: {},
      create: {
        name: 'Staff User',
        email: 'staff@bhie.com',
        password: staffPassword,
        role: Role.STAFF,
      },
    });

    // ✅ Normal user
    const userPassword = await bcrypt.hash('user123', 12);
    const normalUser = await prisma.user.upsert({
      where: { email: 'user@bhie.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'user@bhie.com',
        password: userPassword,
        role: Role.USER,
      },
    });

    const users = [admin, staff, normalUser];

    // ✅ Records
    for (const user of users) {
      await prisma.record.createMany({
        data: [
          {
            title: 'Q1 Sales Report',
            category: 'Sales',
            description: 'Quarterly sales performance analysis.',
            status: Status.COMPLETED,
            userId: user.id,
          },
          {
            title: 'Customer Feedback Analysis',
            category: 'Customer Service',
            description: 'Analysis of customer feedback and reviews.',
            status: Status.IN_PROGRESS,
            userId: user.id,
          },
          {
            title: 'Marketing Campaign Review',
            category: 'Marketing',
            description: 'Review of recent digital campaign.',
            status: Status.PENDING,
            userId: user.id,
          },
        ],
      });
    }

    // ✅ Report (safe check)
    if (users.length > 0) {
      await prisma.report.create({
        data: {
          title: 'Annual Business Report',
          fileUrl: 'https://example.com/reports/annual-2024.pdf',
          userId: users[0].id,
        },
      });
    }

    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});