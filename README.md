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

- PHP 8.2+ (no framework), PDO with prepared statements throughout
- MySQL 8
- Vanilla JS, service worker + IndexedDB for offline
- No build step — this is deliberate, so any team member can run it in minutes

---

## Running it locally

```bash
git clone https://github.com/<OWNER>/readerops.git
cd readerops

cp .env.example .env
# edit .env with your local MySQL credentials

mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql

php -S localhost:8000 -t public
```

Open http://localhost:8000

If you use AMPPS or XAMPP instead, point the document root at `public/`.

---

## Repository layout

```
public/      web root — the only folder the server should expose
  assets/js  calibration, optotype rendering, the trial loop, sync
api/         JSON endpoints called by the PWA
src/
  Core/      database, routing, auth, CSRF
  Screening/ protocol, scorer, integrity checks
database/    schema.sql and seed.sql — the single source of truth for the schema
docs/        architecture, API reference, test protocol
tests/       test cases
```

---

## How we work

Read `CONTRIBUTING.md` before your first commit. Short version:

- `main` is protected. Nobody pushes to it directly.
- Branch per task: `feat/screening-ladder`, `fix/sync-duplicate`
- Every pull request needs one review from someone outside your workstream
- Keep `database/schema.sql` as the only place the schema is defined

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
