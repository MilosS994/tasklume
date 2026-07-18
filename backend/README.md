# Tasklume — Task Management API

A REST API for managing personal tasks, built with **NestJS**, **Prisma ORM**, and **PostgreSQL**. It comes with a full authentication and authorization layer — JWT-based login, role-based access control, and per-resource ownership checks — plus the kind of production-hardening (validation, rate limiting, centralized error handling, secure headers).

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)

---

## What this project actually does

Tasklume lets a user register, log in, and manage their own list of tasks (create, read, update, delete), each with a priority and a status. Admins get a wider view — they can manage all user accounts. That's the whole product surface. The interesting part is _how_ it's built underneath: who's allowed to do what, and what happens when something goes wrong.

## Features

- **JWT authentication** — register and log in, get back a signed access token.
- **Role-based access control** — routes like "list all users" are restricted to admins via a reusable `@Roles()` decorator.
- **Resource ownership checks** — a regular user can only edit or delete _their own_ account and _their own_ tasks. An admin can act on anyone's. This is enforced by dedicated guards, not by convention or hope.
- **Centralized input validation** — every incoming request body is validated and sanitized (unknown fields are stripped, not silently accepted) before it ever reaches business logic.
- **Rate limiting** — general endpoints allow generous traffic; `login` and `register` are throttled much more tightly, since they're the two routes most attractive to brute-force attempts.
- **Centralized database error handling** — a global exception filter translates Prisma's internal error codes (like a unique-constraint violation) into clean, correct HTTP responses (`409 Conflict`, `404 Not Found`, etc.) instead of leaking a raw 500 with database internals.
- **Secure by default** — Helmet sets sensible security headers, CORS is explicitly configured rather than left wide open, and passwords are always hashed before they touch the database.

## Tech Stack

| Layer            | Choice                                                                            |
| ---------------- | --------------------------------------------------------------------------------- |
| Framework        | [NestJS](https://nestjs.com/) 11                                                  |
| Language         | TypeScript                                                                        |
| Database         | PostgreSQL                                                                        |
| ORM              | [Prisma](https://www.prisma.io/) 7 (with the `@prisma/adapter-pg` driver adapter) |
| Auth             | Passport + `@nestjs/jwt`                                                          |
| Validation       | `class-validator` / `class-transformer`                                           |
| Security         | `helmet`, `@nestjs/throttler`                                                     |
| Password hashing | `bcryptjs`                                                                        |
| Containerization | Docker / Docker Compose                                                           |

## Authorization model

There isn't just one gate on these routes — there are three different guards, each answering a different question, stacked in the order that makes sense:

1. **`JwtAuthGuard`** — _"Are you logged in at all?"_ Validates the JWT from the `Authorization` header and, if valid, attaches the decoded user to the request.
2. **`RolesGuard`** — _"Does your role allow this?"_ Reads a `@Roles('admin')` marker off the route and compares it against the logged-in user's role. Used for admin-only endpoints like listing every user.
3. **`SelfOrAdminGuard`** / **`TaskOwnerGuard`** — _"Is this actually yours?"_ For routes that operate on a specific resource (`PATCH /users/:id`, `DELETE /tasks/:id`), these guards check whether the resource belongs to the logged-in user — or whether they're an admin, who can bypass the ownership check. `TaskOwnerGuard` looks the task up in the database first, since ownership of a _task_ can't be inferred from the URL alone the way it can for a user.
   The short version: authentication and authorization are handled in one consistent place (guards), not scattered through `if` statements inside service methods.

## Getting Started

There are two ways to run this locally — pick whichever fits.

### Option A: Docker (recommended)

The whole stack — API and database — runs with one command, no local Node.js or PostgreSQL install required.

**Prerequisites:** Docker and Docker Compose.

```bash
git clone <repository-url>
cd backend
cp .env.example .env   # fill in JWT_SECRET at minimum
docker compose up --build
```

The API will be available at `http://localhost:3000/api/v1`. Database migrations still need to be applied once, from your host machine, against the exposed Postgres port:

```bash
npx prisma migrate dev
```

### Option B: Running natively

#### Prerequisites

- Node.js 20+
- npm
- A running PostgreSQL instance (local or hosted)

#### Installation

```bash
git clone <repository-url>
cd backend
npm install
```

#### Environment variables

Create a `.env` file in the project root (see `.env.example` for a template):

| Variable       | Description                                                                 | Example                                                               |
| -------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string                                                | `postgresql://user:password@localhost:5432/tasklume_db?schema=public` |
| `JWT_SECRET`   | Secret used to sign access tokens — generate with `openssl rand -base64 48` | `a-long-random-string`                                                |
| `CORS_ORIGIN`  | Comma-separated allowed origins (production only)                           | `https://tasklume.app`                                                |
| `PORT`         | Port the server listens on                                                  | `3000`                                                                |
| `NODE_ENV`     | Environment mode                                                            | `development`                                                         |

#### Database setup

```bash
npx prisma migrate dev   # applies migrations locally and creates the DB schema
```

#### Running the app

```bash
npm run start:dev   # development, with hot reload
npm run build        # compile for production
npm run start:prod   # run the compiled build
```

The API is served under the `/api/v1` prefix, e.g. `http://localhost:3000/api/v1/auth/login`.

## API Reference

### Auth

| Method | Route            | Auth required | Description                      |
| ------ | ---------------- | ------------- | -------------------------------- |
| POST   | `/auth/register` | —             | Create a new account             |
| POST   | `/auth/login`    | —             | Log in, receive a JWT            |
| GET    | `/auth/me`       | ✅            | Get the currently logged-in user |

### Users

| Method | Route        | Auth required | Description      |
| ------ | ------------ | ------------- | ---------------- |
| GET    | `/users`     | Admin         | List all users   |
| GET    | `/users/:id` | Admin         | Get a user by ID |
| PATCH  | `/users/:id` | Self or Admin | Update a user    |
| DELETE | `/users/:id` | Self or Admin | Delete a user    |

### Tasks

| Method | Route        | Auth required  | Description                          |
| ------ | ------------ | -------------- | ------------------------------------ |
| POST   | `/tasks`     | ✅             | Create a task for the logged-in user |
| GET    | `/tasks`     | ✅             | List the logged-in user's tasks      |
| GET    | `/tasks/:id` | Owner or Admin | Get a single task                    |
| PATCH  | `/tasks/:id` | Owner or Admin | Update a task                        |
| DELETE | `/tasks/:id` | Owner or Admin | Delete a task                        |

## Available Scripts

| Command              | What it does                            |
| -------------------- | --------------------------------------- |
| `npm run start:dev`  | Run in watch mode for local development |
| `npm run build`      | Compile TypeScript to `dist/`           |
| `npm run start:prod` | Run the compiled app (`dist/main.js`)   |
| `npm run lint`       | Lint and auto-fix with ESLint           |
| `npm run format`     | Format the codebase with Prettier       |
| `npm test`           | Run unit tests                          |
| `npm run test:e2e`   | Run end-to-end tests                    |

## Data Model

- **User** — email, username, hashed password, optional full name, role (`user` / `admin`).
- **Task** — title, optional description, priority (`low` / `medium` / `high`), status (`todo` / `in_progress` / `done`), owned by a `User`.
  Full schema lives in `prisma/schema.prisma`.

## Live Demo

🚧 Coming soon — being deployed on [Render](https://render.com).

## License

This project is unlicensed / private, built as a personal portfolio project by **Miloš Srejić**.
