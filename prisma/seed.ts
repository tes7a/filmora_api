import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, user_status } from '@prisma/client';
import bcrypt from 'bcrypt';

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

  const roleRecords = await prisma.roles.findMany({
    where: { code: { in: ['user', 'moderator', 'admin'] } },
  });

  const roleByCode = new Map(roleRecords.map((r) => [r.code, r]));

  const passwordHash = await bcrypt.hash('Password123!', 10);
  const now = new Date();

  const firstNames = [
    'Alex',
    'Mia',
    'Ivan',
    'Emma',
    'Liam',
    'Olga',
    'Noah',
    'Sofia',
    'Mark',
    'Anna',
  ];
  const lastNames = [
    'Smith',
    'Johnson',
    'Brown',
    'Ivanov',
    'Petrova',
    'Sidorov',
    'Miller',
    'Davis',
    'Garcia',
    'Wilson',
  ];

  const randomItem = <T>(items: T[]) =>
    items[Math.floor(Math.random() * items.length)];

  const randomPastDate = (days: number) => {
    const offset = Math.floor(Math.random() * days);
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d;
  };

  const ensureUser = async (
    email: string,
    displayName: string,
    lastLoginAt?: Date | null,
  ) => {
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) return existing;

    return prisma.users.create({
      data: {
        email,
        password_hash: passwordHash,
        display_name: displayName,
        status: user_status.active,
        created_at: now,
        updated_at: now,
        last_login_at: lastLoginAt ?? null,
      },
    });
  };

  const ensureRole = async (userId: string, roleCode: 'user' | 'moderator' | 'admin') => {
    const role = roleByCode.get(roleCode);
    if (!role) return;

    const existing = await prisma.user_roles.findFirst({
      where: { user_id: userId, role_id: role.id },
    });

    if (existing) return;

    await prisma.user_roles.create({
      data: {
        user_id: userId,
        role_id: role.id,
        assigned_at: now,
      },
    });
  };

  // Seed admin & moderator
  const adminUser = await ensureUser('admin@example.com', 'Admin');
  await ensureRole(adminUser.id, 'admin');

  const moderatorUser = await ensureUser('moderator@example.com', 'Moderator');
  await ensureRole(moderatorUser.id, 'moderator');

  // Seed mock users
  for (let i = 1; i <= 50; i += 1) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const email = `user${i}@example.com`;
    const displayName = `${firstName} ${lastName}`;
    const lastLoginAt = Math.random() < 0.8 ? randomPastDate(60) : null;
    const user = await ensureUser(email, displayName, lastLoginAt);
    await ensureRole(user.id, 'user');
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
