# Brev.ly — Server

Fastify REST API for the [Brev.ly](https://github.com/patriciasegantine/brev.ly-client) URL shortening platform.

---

## 🧩 Overview

A full-stack URL shortening and management platform — create, track, and manage short links efficiently.

Users can:
- Generate short links with validation and duplicate prevention
- Track access counts
- Manage and delete links
- Export data as CSV via Cloudflare R2 CDN

---

## ⚙️ Tech stack

Fastify · TypeScript · PostgreSQL · Drizzle ORM · Zod · Swagger · Docker

---

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

---

## 📖 API Documentation

- `GET /docs` — Scalar UI (interactive)
- `GET /docs/json` — OpenAPI schema (JSON)

---

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

---

## 👩‍💻 Author

Created by **Patricia Segantine** — Frontend Developer
[LinkedIn](https://linkedin.com/in/patriciasegantine) · [Portfolio](https://patriciasegantine.vercel.app/)
