# Redirect Lab — Server

Fastify REST API for the [Redirect Lab](https://github.com/patriciasegantine/redirect-lab-client) URL shortening platform.

## Overview

Redirect Lab is a full-stack URL shortener built around a simple idea: link management should feel immediate, reliable, and pleasantly uneventful. The server provides the REST API that powers the entire link lifecycle — from creating a memorable slug to monitoring access counts and exporting the collection as CSV.

The API handles validation, persistence, and storage integration so the client can stay focused on the interface.

[Client repository](https://github.com/patriciasegantine/redirect-lab-client) ·
[Interactive docs](https://redirect-lab-server-production.up.railway.app/docs)

### What the API provides

- Create validated short links with duplicate slug prevention
- Resolve slugs to original URLs and record each access
- List links with search, pagination, and sort controls
- Delete links by ID
- Export the complete link collection as CSV via Cloudflare R2

## Background

Redirect Lab started as [Brev.ly](https://github.com/patriciasegantine/brev.ly), developed during a postgraduate course to explore full-stack development and AWS. After the course ended, the original monorepo became the foundation for a broader personal project: the application was rebranded, the client and server were split into independent repositories, and new features were layered on top.

The infrastructure choices shifted deliberately toward low-cost or free-tier services: Neon for serverless PostgreSQL, Railway for server deployment, Cloudflare R2 for object storage, and Vercel for the client. This makes the project practical to run and iterate on outside of a classroom or enterprise environment.

This repository contains the API server. The React client and its routing logic live in the [Redirect Lab client repository](https://github.com/patriciasegantine/redirect-lab-client).

## How it works

1. Incoming requests are validated by Fastify and Zod before reaching any business logic.
2. Each route delegates to a dedicated use case that owns the operation end-to-end.
3. Use cases read from and write to PostgreSQL through Drizzle ORM.
4. Side effects like access count increments happen inside the same use case, keeping operations atomic.
5. CSV exports are streamed, formatted, and uploaded to Cloudflare R2 — the client receives a signed public URL.
6. Errors propagate through an Either pattern; the route layer maps them to the appropriate HTTP status code.

## Tech stack

| Area | Technologies |
| --- | --- |
| Runtime | Node.js 22, TypeScript |
| HTTP server | Fastify 5, fastify-type-provider-zod |
| Validation | Zod |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Neon) |
| Storage | Cloudflare R2 (AWS S3-compatible) |
| API docs | @fastify/swagger + Scalar |
| Testing | Vitest |
| Delivery | GitHub Actions, Railway |

## Project structure

```text
src/
├── routes/        # HTTP layer — request parsing, schema definition, response shaping
├── use-cases/     # Business logic — one file per operation, tested in isolation
├── db/            # Drizzle schema, migrations, and database client
├── services/      # External integrations (Cloudflare R2)
├── errors/        # Global error handler middleware
├── shared/        # Either type for explicit error propagation
└── test/          # Test setup and database preparation
```

Each feature (e.g. `create-link`) owns its route, use case, and tests in parallel directories, making it straightforward to trace a request from the HTTP layer to the database and back.

## API endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Server health check |
| `POST` | `/links` | Create a short link |
| `GET` | `/links` | List links (search, sort, paginate) |
| `GET` | `/links/:shortUrl` | Resolve a slug → original URL + increment counter |
| `DELETE` | `/links/:id` | Delete a link by ID |
| `POST` | `/links/export` | Export all links as CSV to Cloudflare R2 |
| `GET` | `/docs` | Scalar interactive API reference |
| `GET` | `/docs/json` | OpenAPI schema (JSON) |

## Running locally

### Requirements

- Node.js 22+
- npm
- Docker (for the local PostgreSQL instance)

### Setup

```bash
npm install
cp .env.example .env
# fill in the values in .env
docker compose up -d
npm run db:migrate
npm run dev
```

The server starts at `http://localhost:3333`.

### Environment variables

```dotenv
PORT=
DATABASE_URL=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY=
CLOUDFLARE_BUCKET=
CLOUDFLARE_PUBLIC_URL=
```

| Variable | Purpose |
| --- | --- |
| `PORT` | Port the server listens on (defaults to `3333`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account for R2 access |
| `CLOUDFLARE_ACCESS_KEY_ID` | R2 access key |
| `CLOUDFLARE_SECRET_ACCESS_KEY` | R2 secret key |
| `CLOUDFLARE_BUCKET` | R2 bucket name for CSV exports |
| `CLOUDFLARE_PUBLIC_URL` | Public base URL of the R2 bucket |

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Compile TypeScript for production |
| `npm run start` | Run the compiled application |
| `npm run db:generate` | Generate Drizzle migrations from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run test` | Prepare test database and run the full suite |
| `npm run test:db:prepare` | Create and migrate the test database |
| `npm run test:run` | Run Vitest in run mode |
| `npm run pre-pr` | Run tests and build (gate before opening a PR) |

## API documentation

The server ships with an interactive API reference powered by [Scalar](https://scalar.com), generated from the OpenAPI schema that Fastify and Zod produce automatically.

- `GET /docs` — Scalar UI with try-it-out support
- `GET /docs/json` — Raw OpenAPI schema in JSON

All endpoints are tagged (Links, Export, Health), include summaries and descriptions, and document every response shape including error bodies.

## Delivery and quality

Pull requests run automated tests, type-checking, and a production build through GitHub Actions. Railway deploys changes merged into `main` to production automatically.

The test suite covers both use cases and route handlers with an in-process Fastify server against a real PostgreSQL database — no mocks at the persistence layer, so tests catch schema-level regressions too.

## What's next

- **Access dashboard**: aggregate access data per link with timestamps, enabling click-over-time charts on the client
- **Link expiration**: optional expiry date stored on creation, with a distinct expired state returned by the resolver
- **QR Code endpoint**: server-side QR Code generation per link, returned as PNG
- **UTM parameter support**: structured UTM fields appended to original URLs before redirect

## License

This project is licensed under the [MIT License](LICENSE).

## Author

Created by **Patricia Segantine** — Senior Frontend Developer

[LinkedIn](https://linkedin.com/in/patriciasegantine) · [Portfolio](https://patriciasegantine.vercel.app/)
