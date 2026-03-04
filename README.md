# Filmora API

Backend API for a film catalog platform built with NestJS, PostgreSQL, and Prisma.

## Stack

- Node.js 22+
- NestJS 11
- PostgreSQL
- Prisma ORM
- pnpm
- Swagger (OpenAPI)
- Jest
- ESLint + Prettier + Husky

## Implemented Modules

- `auth`
- `admin`
- `films`
- `recommendations`
- `persons`
- `reviews`
- `comments`
- `complaints`
- `lists`

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Create `.env` from example:

```bash
cp .env.exmaple .env
```

3. Start PostgreSQL via Docker:

```bash
docker compose up -d
```

4. Configure DB port in `.env`:

- `docker-compose.yml` exposes Postgres on `localhost:5433`
- set `DATABASE_URL` / `DIRECT_URL` to `5433` if using Docker locally

Example:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/filmora?schema=public
DIRECT_URL=postgresql://postgres:postgres@localhost:5433/filmora
```

5. Apply migrations and generate Prisma client:

```bash
pnpm exec prisma migrate deploy
pnpm exec prisma generate
```

6. (Optional) Seed mock data:

```bash
pnpm exec prisma db seed
```

7. Run app:

```bash
pnpm start
```

## Scripts

- `pnpm start` - run in watch mode
- `pnpm build` - typecheck + build to `dist`
- `pnpm start:prod` - run built app
- `pnpm lint` - lint check
- `pnpm lint:fix` - lint autofix
- `pnpm typecheck` - TypeScript check
- `pnpm test` - unit tests
- `pnpm test:e2e` - e2e tests

## API Docs

Swagger UI:

- `http://localhost:3000/api/docs`

## Key Public Endpoints

- `GET /api/films`
- `GET /api/films/:id`
- `GET /api/films/:id/full`
- `GET /api/films/:id/similar`
- `GET /api/recommendations/popular`
- `GET /api/recommendations/new`
- `GET /api/persons`
- `GET /api/persons/:id`
- `GET /api/reviews/:id`
- `GET /api/reviews/:id/comments`

Most list endpoints support search/sort/pagination query params.

## Admin Content Endpoints

Available under `/api/admin` (requires `admin` or `moderator` role):

- Genres: `GET/POST/PATCH/DELETE /genres`, `POST /genres/:id/merge`
- Tags: `GET/POST/PATCH/DELETE /tags`
- Countries: `GET/POST/PATCH/DELETE /countries`
- Persons: `GET/POST/PATCH/DELETE /persons`
- Films: `GET/POST/PATCH/DELETE /films`

Admin moderation endpoints are also available for complaints/reviews/comments/users.

## Project Structure

```text
src/
  app.module.ts
  main.ts
  modules/
    auth/
    admin/
    films/
    recommendations/
    persons/
    reviews/
    comments/
    complaints/
    lists/
  shared/
    infrastructure/
      prisma/
      core/
      email/
  utils/
prisma/
  schema.prisma
  seed.ts
```

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs checks on push/PR.

## License

UNLICENSED
