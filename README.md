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
