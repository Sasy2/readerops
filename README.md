# ReaderOps

A near-vision screening and distribution system for ready-made reading glasses.

Distributors run a standardised near-vision screening on their own phone, sell only
against a screening the **server** has scored, and every sale, referral and commission
is tied to a named customer. Built for CS341 Web Technologies, Ashesi University,
Semester 1 2026/2027.

---

## What it does

| Part | What it is |
| --- | --- |
| Distributor PWA | Installable web app, works with no network, queues and syncs |
| Screening | Tumbling-E near-vision test, card-calibrated, scored server-side |
| Stock | Per-distributor inventory by lens power, allocation and confirmation |
| Sales | A sale cannot exist without a screening the server scored as BUY |
| Referrals | Raised automatically, tracked until closed |
| Admin dashboard | Usage, quality flags, commissions, programme metrics |

The screening protocol is adopted from published clinical sources, not invented.
See `docs/test-protocol.md`.

> ReaderOps identifies people who may benefit from ready-made reading glasses, and
> refers everyone else to an eye care professional. It does not diagnose eye conditions.

---

## Stack

| Part | Tech |
| --- | --- |
| `client/` | Vanilla JavaScript, npm + Vite (dev server and bundling): distributor PWA and admin dashboard |
| `server/` | Laravel 13 (PHP 8.5): API, server-side scoring, integrity flags |
| Database | Supabase cloud (Postgres). There is no local database |

---

## Running it locally

Requirements: Node 24+, PHP 8.5 with `pdo_pgsql`, Composer, and access to the team's
Supabase project.

```bash
git clone https://github.com/<OWNER>/readerops.git
cd readerops

# Server (Laravel) → http://localhost:8000
cd server
composer install
cp .env.example .env
php artisan key:generate
# fill DB_* from Supabase: Project Settings > Database > Connect > Session pooler
php artisan serve

# Client (vanilla JS + Vite) → http://localhost:5173, in a second terminal
cd client
npm install
cp .env.example .env.local
# fill VITE_SUPABASE_* from Supabase: Project Settings > API
npm run dev
```

Never commit `.env` / `.env.local`, and never put the Supabase service role key in `client/`.

---

## Repository layout

```
client/      vanilla JS app built with Vite (distributor PWA + admin dashboard)
server/      Laravel app (API, scoring, migrations for the Supabase database)
docs/        architecture, API reference, test protocol
```

---

## How we work

Read `CONTRIBUTING.md` before your first commit. Short version:

- `main` is protected. Nobody pushes to it directly.
- Branch per task: `feat/screening-ladder`, `fix/sync-duplicate`
- Every pull request needs one review from someone outside your workstream
- Laravel migrations in `server/database/migrations` are the only place the schema is defined

---

## Team

| Name | Workstream | GitHub |
| --- | --- | --- |
| | Screening front end | |
| | API and data | |
| | Stock, sales, commission | |
| | Dashboard and metrics | |
| | Security, deployment, docs | |

Everyone reviews pull requests outside their own workstream. In the viva any of us
can be asked about any part of this repository.

---

## Documentation

- [Architecture](docs/architecture.md)
- [API reference](docs/api.md)
- [Test protocol](docs/test-protocol.md) — the clinical specification and its sources
