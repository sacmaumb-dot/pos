SaaS POS — multi-tenant POS / service-ticket / inventory app built on Next.js 16 + Prisma + Postgres.

## Getting Started

### 1. Prerequisites

- Node.js 20+ and npm
- Docker (for local Postgres) — or any reachable Postgres 14+ instance

### 2. Database

The repo ships a `docker-compose.yml` that starts a local Postgres on port `5433`:

```bash
docker compose up -d
```

Then copy `.env.example` to `.env`. The default `DATABASE_URL` already matches the docker-compose container:

```bash
cp .env.example .env
```

If you point `DATABASE_URL` at a hosted Postgres (Supabase / Neon / Railway / RDS / …), no other change is needed.

### 3. Install + migrate + seed

```bash
npm install
npm run db:migrate           # apply prisma/migrations/* to the database
npm run db:seed              # populate demo tenants + users
```

Seed test accounts (password for all: `admin123`):

| Email | Role | Tenant |
|---|---|---|
| `superadmin@mypos.vn` | super-admin | (global) |
| `admin@applecare.com` | tenant admin | `applecare` |
| `admin@techshop.com` | tenant admin | `techshop` |

### 4. Run

```bash
npm run dev
```

The app is multi-tenant via subdomain. In local dev:

- Root / signup: <http://localhost:3000>
- Apple Care tenant: <http://applecare.localhost:3000>
- TechShop tenant: <http://techshop.localhost:3000>
- Super-admin: <http://localhost:3000/admin-login>

### 5. Useful scripts

| Script | What it does |
|---|---|
| `npm run db:migrate` | Apply pending migrations (dev — uses `prisma migrate dev`). |
| `npm run db:migrate:deploy` | Apply migrations in CI / prod (`prisma migrate deploy`). |
| `npm run db:reset` | Drop everything and re-run migrations + seed. |
| `npm run db:push` | Sync the schema without creating a migration (only for quick prototyping). |
| `npm run db:seed` | Re-run `prisma/seed.ts`. |

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
