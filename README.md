# INFNOVA Backend Internship — Applicant Management API

A RESTful API for managing internship applications, built for the INFNOVA Technologies Backend Internship practical challenge.

---

## Tech Stack

| Layer          | Technology                            |
| -------------- | ------------------------------------- |
| Framework      | NestJS (TypeScript)                   |
| ORM            | Prisma                                |
| Database       | SQLite (file-based, zero config)      |
| Authentication | Passport JWT + Bcrypt                 |
| Validation     | class-validator + class-transformer   |
| Documentation  | Swagger / OpenAPI (`@nestjs/swagger`) |
| Testing        | Jest + ts-jest                        |

---

## Local Setup Instructions

### Prerequisites

- Node.js v18+
- npm

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd infnova-applicant-management
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set a strong `JWT_SECRET`:

```dotenv
DATABASE_URL="file:./dev.db"
PORT=3000
JWT_SECRET="replace-with-a-strong-random-secret"
```

### 3. Run database migrations

```bash
npx prisma migrate deploy
```

### 4. Seed the database

```bash
npx prisma db seed
```

This creates one admin account and three sample applicants.

### 5. Start the server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

---

## API Documentation

Swagger UI is available at:

```
http://localhost:3000/api/docs
```

All protected endpoints require a Bearer JWT token. Use the **Authorize** button in Swagger UI after logging in.

---

## Authentication

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@infnova.tech",
  "password": "Admin@123456"
}
```

Copy the `access_token` from the response and use it as a Bearer token on all subsequent requests:

```
Authorization: Bearer <access_token>
```

### Get current admin profile

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

---

## API Endpoints

| Method | Endpoint                     | Auth | Description                            |
| ------ | ---------------------------- | ---- | -------------------------------------- |
| POST   | `/api/auth/login`            | No   | Admin login                            |
| GET    | `/api/auth/me`               | Yes  | Get logged-in admin profile            |
| POST   | `/api/applicants`            | Yes  | Create applicant                       |
| GET    | `/api/applicants`            | Yes  | Paginated list with search/filter/sort |
| GET    | `/api/applicants/:id`        | Yes  | Get single applicant                   |
| PATCH  | `/api/applicants/:id`        | Yes  | Update applicant details               |
| DELETE | `/api/applicants/:id`        | Yes  | Soft-delete applicant                  |
| PATCH  | `/api/applicants/:id/status` | Yes  | Update applicant status                |
| PATCH  | `/api/applicants/:id/notes`  | Yes  | Update internal notes                  |
| GET    | `/api/dashboard/summary`     | Yes  | Dashboard statistics                   |

### Query parameters for `GET /api/applicants`

| Parameter   | Type            | Description                                                        |
| ----------- | --------------- | ------------------------------------------------------------------ |
| `page`      | number          | Page number (default: 1)                                           |
| `limit`     | number          | Items per page (default: 10)                                       |
| `search`    | string          | Search by full name or email                                       |
| `status`    | enum            | Filter: `PENDING`, `SHORTLISTED`, `ACCEPTED`, `REJECTED`           |
| `track`     | enum            | Filter: `FRONTEND`, `BACKEND`, `MOBILE`, `UI_UX`, `DATA_ANALYTICS` |
| `sortBy`    | string          | Field to sort by (default: `createdAt`)                            |
| `sortOrder` | `asc` \| `desc` | Sort direction (default: `desc`)                                   |

---

## Architecture

```
src/
├── common/
│   └── filters/
│       └── http-exception.filter.ts   # Global exception handler — uniform error shape
├── auth/                               # JWT authentication module
│   ├── dto/login.dto.ts
│   ├── guards/jwt-auth.guard.ts
│   └── strategies/jwt.strategy.ts
├── applicants/                         # Core applicant CRUD module
│   ├── dto/                            # Input validation DTOs
│   ├── applicants.controller.ts        # Route handlers only, no business logic
│   └── applicants.service.ts           # All business rules and DB queries
├── dashboard/                          # Summary statistics module
├── prisma/                             # PrismaService + seed script
└── main.ts                             # Bootstrap: global pipes, filter, Swagger
```

**Key design decisions:**

- Business logic lives exclusively in services, controllers are thin route handlers.
- Soft delete is enforced at the query level — every `findMany` and `findFirst` includes `deletedAt: null`.
- Status transition rules are validated in the service before any DB write.
- `ConfigModule` is set to `isGlobal: true` so `ConfigService` is available in all modules without re-importing.
- A global `AllExceptionsFilter` catches both `HttpException` and unexpected errors, returning a consistent JSON shape with `statusCode`, `timestamp`, and `path`.

---

## Business Rules

- **Email uniqueness**: enforced at creation and update.
- **Notes limit**: maximum 1,000 characters.
- **Forbidden status transition**: `REJECTED → ACCEPTED` is blocked.
- **Soft delete**: `deletedAt` is stamped; hard deletes are never performed.
- **Deleted records**: excluded from all list queries and dashboard statistics.
- **Authentication**: all write and read operations on applicants and dashboard require a valid JWT.

---

## Testing

Run the unit test suite:

```bash
npm test
```

Run with coverage report:

```bash
npm run test:cov
```

Run end-to-end tests:

```bash
npm run test:e2e
```

Tests cover:

- Auth service — invalid credentials, missing admin
- Applicants service — duplicate email, soft delete, `REJECTED → ACCEPTED` guard, `findOne` on deleted record
- Controller wiring for all modules

---

## Migration & Seed Reference

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name <migration-name>

# Apply existing migrations (CI / production)
npx prisma migrate deploy

# Reset DB and re-seed (development only)
npx prisma migrate reset

# Seed without resetting
npx prisma db seed
```

---

## Assumptions & Known Limitations

- SQLite is used for simplicity. Switching to PostgreSQL requires only changing `provider` in `schema.prisma` and updating `DATABASE_URL`.
- The `notes` field on `PATCH /:id/notes` is optional — omitting it or passing an empty string clears the notes.
- There is a single admin account (created by the seed). There is no admin self-registration endpoint by design.
- Docker Compose is not included but the app runs with a single `npm run start:dev` after seeding.
