# Filmora API 🎬

Backend API for a film catalog platform built with **NestJS**, **PostgreSQL**, and **Prisma**.  
The project focuses on clean architecture, real-world tooling, and production-ready practices (CI, Docker, validation, migrations, etc.).

---

## ✨ Features

- NestJS (modular architecture)
- PostgreSQL (local via Docker, production via Supabase)
- Prisma ORM (schema, migrations, type-safe queries)
- Swagger (OpenAPI documentation)
- Validation with `class-validator`
- ESLint + Prettier + Husky + lint-staged
- Unit tests with Jest
- GitHub Actions CI (lint, typecheck, tests)
- Docker for local database

---

## 🛠 Tech Stack

- **Node.js** 22+
- **NestJS**
- **Prisma ORM**
- **PostgreSQL**
- **Supabase** (production database)
- **pnpm**
- **Jest**
- **GitHub Actions**

---

## 📦 Project Setup

```bash
pnpm install
```

---

## 🐘 Database (Local with Docker)

Start local PostgreSQL:

```bash
docker compose up -d
```

Environment example (`.env`):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/filmora?schema=public"
```

Prisma:

```bash
pnpm exec prisma generate
pnpm exec prisma studio
```

---

## ▶️ Running the Project

```bash
# development
pnpm start

# production build
pnpm build
pnpm start:prod
```

---

## 🧪 Testing

```bash
# unit tests
pnpm test

# type checking
pnpm typecheck

# lint
pnpm lint
```

---

## 📖 API Documentation (Swagger)

After running the app:

👉 http://localhost:3000/api/docs

---

## 🔄 Migrations

Migrations are stored in:

```
prisma/migrations/
```

Apply migrations (production example):

```bash
DATABASE_URL=... DIRECT_URL=... pnpm exec prisma migrate deploy
```

---

## 🤖 CI (GitHub Actions)

On every push and pull request:

- pnpm install
- pnpm lint
- pnpm typecheck
- pnpm test

Workflow file:

```
.github/workflows/ci.yml
```

---

## 📁 Project Structure

```
src/
  modules/        # feature modules (films, users, reviews, etc.)
  common/         # shared filters, pipes, guards
  database/       # Prisma module/service
  main.ts         # app bootstrap
prisma/
  schema.prisma   # data models
  migrations/     # migration history
```

---

## 🚀 Goals of the Project

This project is part of a coursework but is designed to match real-world backend practices:

- Clean architecture
- Production-ready tooling
- Type safety
- Testability
- Infrastructure awareness

---

## 👤 Author

Konstantin Dudkin  
Software Engineer / Backend & Full-stack

---

## 📄 License

MIT
