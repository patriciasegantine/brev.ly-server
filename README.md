# Brev.ly Server

Brev.ly Server is the back-end API for a URL shortening and management platform.  
It provides the API responsible for creating, listing, redirecting, deleting, and exporting shortened links.

## Overview

This API supports the Brev.ly client by handling the main business rules and persistence layer.  
The API is responsible for:

- creating shortened links
- validating short URLs and avoiding duplicates
- deleting links
- resolving shortened URLs to their original destination
- listing all stored links
- incrementing access counters
- exporting link data as a CSV file.

## Technologies used

- TypeScript
- Fastify
- Drizzle ORM
- PostgreSQL
- Zod
- Swagger
- CORS
- dotenv

## Project requirements

This server application follows the requirements defined for the project:

- use of TypeScript, Fastify, Drizzle, and PostgreSQL;
- CORS enabled;
- `.env.example` file with the required variables;
- database migrations available through the required script;
- Docker support for building the application image.

---

## Scripts

Available scripts in this project:

- `npm run dev` — start the development server with environment variables loaded from `.env`;
- `npm run build` — build the server for production;
- `npm run start` — run the compiled application;
- `npm run db:generate` — generate database migrations;
- `npm run db:migrate` — run database migrations;
- `npm run db:studio` — open Drizzle Studio;
- `npm run test` — run the test suite;
- `npm run test:db:prepare` — prepare the test database;
- `npm run test:run` — execute Vitest in run mode.

## Environment variables

Create a `.env` file based on `.env.example`:

```env
PORT= DATABASE_URL=
CLOUDFLARE_ACCOUNT_ID= CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY= CLOUDFLARE_BUCKET= 
CLOUDFLARE_PUBLIC_URL=
```

## Getting started

1. Install the dependencies.
2. Configure the environment variables.
3. Run the database and apply the migrations.
4. Start the server application.

## Related documentation

- [Root README](../README.md)
- [Client README](../client/README.md)

---

## ✅ Checklist

- [x] A link can be created
  - [x] A link with a badly formatted short URL must not be created
  - [x] A link with a duplicate short URL must not be created
- [x] A link can be deleted
- [x] The original URL can be retrieved via the short URL
- [x] All registered URLs can be listed
- [x] The access count of a link can be incremented
- [x] Links can be exported as a CSV file
  - [x] The CSV is accessible via a CDN (Cloudflare R2)
  - [x] A random and unique filename is generated for each export
  - [x] The listing is performed in a performant way
  - [x] The CSV contains original URL, short URL, access count and creation date
- [x] CORS enabled
- [x] `.env.example` file with all required variables
- [x] `db:migrate` script available for running database migrations
- [x] Dockerfile following best practices to build the application image

### ⭐ Extras

- [x] API documentation with Swagger UI
- [x] Automated CI/CD — test and build pipeline via GitHub Actions
- [x] Automated tests with Vitest
