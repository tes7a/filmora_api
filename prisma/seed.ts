import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Seed roles
  const roles = [
    { code: 'user' as const, name: 'User', description: 'Regular user role' },
    {
      code: 'moderator' as const,
      name: 'Moderator',
      description: 'Moderator role',
    },
    {
      code: 'admin' as const,
      name: 'Admin',
      description: 'Administrator role',
    },
  ];

  for (const role of roles) {
    const existing = await prisma.roles.findFirst({
      where: { code: role.code },
    });

    if (!existing) {
      await prisma.roles.create({ data: role });
      console.log(`Role "${role.code}" created`);
    } else {
      console.log(`Role "${role.code}" already exists`);
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
