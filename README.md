# Brev.ly — Server

Fastify API with PostgreSQL. See the [root README](../README.md) for full project details.

## 🔐 Environment variables

```dotenv
PORT=
DATABASE_URL=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY=
CLOUDFLARE_BUCKET=
CLOUDFLARE_PUBLIC_URL=
```

## 📖 API Documentation

- `GET /docs` — Scalar UI (interactive)
- `GET /docs/json` — OpenAPI schema (JSON)

## 📜 Scripts

- `npm run dev` — start development server
- `npm run build` — build for production
- `npm run start` — run compiled application
- `npm run db:generate` — generate migrations
- `npm run db:migrate` — run migrations
- `npm run db:studio` — open Drizzle Studio
- `npm run test` — run the test suite
- `npm run test:db:prepare` — prepare test database
- `npm run test:run` — run Vitest in run mode
