import { PrismaPg } from '@prisma/adapter-pg';
import {
  film_status,
  genre_status,
  PrismaClient,
  user_status,
} from '@prisma/client';
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

  const ageRatings = ['G', 'PG', 'PG-13', 'R'] as const;
  const filmAdjectives = [
    'Silent',
    'Hidden',
    'Broken',
    'Golden',
    'Midnight',
    'Neon',
    'Lost',
    'Final',
    'Last',
    'Dark',
  ];
  const filmNouns = [
    'Code',
    'Echo',
    'Signal',
    'City',
    'Orbit',
    'Memory',
    'Shadow',
    'Protocol',
    'Horizon',
    'Legacy',
  ];

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

  // Seed genres
  const genresToSeed = [
    { name: 'Action', slug: 'action', description: 'Action films' },
    { name: 'Drama', slug: 'drama', description: 'Drama films' },
    { name: 'Comedy', slug: 'comedy', description: 'Comedy films' },
    { name: 'Sci-Fi', slug: 'sci-fi', description: 'Science fiction films' },
    { name: 'Thriller', slug: 'thriller', description: 'Thriller films' },
    { name: 'Fantasy', slug: 'fantasy', description: 'Fantasy films' },
    { name: 'Crime', slug: 'crime', description: 'Crime films' },
    { name: 'Adventure', slug: 'adventure', description: 'Adventure films' },
  ] as const;

  for (const genre of genresToSeed) {
    const existing = await prisma.genres.findUnique({
      where: { slug: genre.slug },
      select: { id: true },
    });

    if (!existing) {
      await prisma.genres.create({
        data: {
          name: genre.name,
          slug: genre.slug,
          description: genre.description,
          status: genre_status.active,
          created_at: now,
          updated_at: now,
        },
      });
      console.log(`Genre "${genre.slug}" created`);
    }
  }

  const genreRecords = await prisma.genres.findMany({
    where: { slug: { in: genresToSeed.map((genre) => genre.slug) } },
    select: { id: true, slug: true },
  });
  const genreBySlug = new Map(genreRecords.map((genre) => [genre.slug, genre]));

  // Seed films
  const filmsToSeed = Array.from({ length: 50 }, (_, index) => {
    const i = index + 1;
    const adjective = filmAdjectives[index % filmAdjectives.length];
    const noun = filmNouns[Math.floor(index / filmAdjectives.length) % filmNouns.length];
    const releaseYear = 1980 + (index % 46);
    const durationMin = 85 + (index % 70);
    const averageRating = Number((5 + (index % 41) * 0.1).toFixed(1));
    const ratingsCount = 100 + index * 37;

    return {
      title: `${adjective} ${noun} ${i}`,
      originalTitle: `mock-film-${String(i).padStart(3, '0')}`,
      description: `Mock description for ${adjective} ${noun} ${i}.`,
      releaseYear,
      durationMin,
      ageRating: ageRatings[index % ageRatings.length],
      averageRating,
      ratingsCount,
      popularityScore: Number((averageRating * ratingsCount * 0.1).toFixed(2)),
      genres: [
        genresToSeed[index % genresToSeed.length].slug,
        genresToSeed[(index + 3) % genresToSeed.length].slug,
      ],
    };
  });

  for (const film of filmsToSeed) {
    const existing = await prisma.films.findUnique({
      where: { original_title: film.originalTitle },
      select: { id: true },
    });

    if (existing) {
      continue;
    }

    const createdFilm = await prisma.films.create({
      data: {
        title: film.title,
        original_title: film.originalTitle,
        description: film.description,
        release_year: film.releaseYear,
        duration_min: film.durationMin,
        age_rating: film.ageRating,
        status: film_status.visible,
        average_rating: film.averageRating,
        ratings_count: film.ratingsCount,
        popularity_score: film.popularityScore,
        created_at: now,
        updated_at: now,
      },
      select: { id: true },
    });

    const filmGenresData = film.genres
      .map((slug) => genreBySlug.get(slug))
      .filter((genre): genre is { id: string; slug: string } => Boolean(genre))
      .map((genre) => ({
        film_id: createdFilm.id,
        genre_id: genre.id,
        created_at: now,
      }));

    if (filmGenresData.length) {
      await prisma.film_genres.createMany({
        data: filmGenresData,
        skipDuplicates: true,
      });
    }
  }

  console.log('50 mock films ensured');

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
