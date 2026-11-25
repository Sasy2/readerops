# AGENTS.md

Rules for any AI coding agent (Claude Code, Copilot, Cursor, etc.) working in this repo.
Read this before making changes. Product requirements live in the ReaderOps User
Requirements doc; cite requirement IDs (A-, D-, S-, C-, X-) when you implement them.

## Project at a glance

| Part | Stack | Notes |
| --- | --- | --- |
| `client/` | Vanilla JavaScript, npm, Vite | No frameworks (no React, Next.js, Vue). Distributor PWA + admin dashboard |
| `server/` | Laravel 13, PHP 8.5 | REST API, server-side scoring, integrity flags |
| Database | Supabase **cloud** (Postgres) | Never a local database. Schema changes only via Laravel migrations |

Core rule: **the phone observes, the server decides.** The client sends raw records only;
every outcome that counts (BUY / REFER / BLOCKED / NO_CORRECTION_NEEDED, commission,
flags) is computed on the server.

## 1. Tickets: one sub-issue, one branch, one PR

Work is tracked as GitHub issues. Each **epic** (parent issue) has **sub-issues**; you
always work on a single sub-issue (or a small standalone issue). Labels tell you where it
belongs:

- Area: `server` (Laravel, `server/`) or `ui` (vanilla JS, `client/`)
- Phase: `phase-1` … `phase-5`. `phase-1` is only the minimal setup needed to test.

**Stay inside the ticket's scope.**
- A `server` ticket changes only `server/` (and docs). Do not touch `client/`.
- A `ui` ticket changes only `client/` (and docs). Do not touch `server/`. Use mock data
  until the server endpoint exists; follow the contract in `docs/api.md`.
- Do only what the ticket's Tasks list. Anything else you find (bugs, refactors, missing
  endpoints) gets a new issue, not extra changes in this PR.

Tickets owned by someone without GitHub access yet are recorded in `tickets/<issue-number>.md`.

Never commit to `main`.

```
<type>/<issue-number>-<short-name>

feat/12-screening-ladder
fix/31-sync-duplicate
docs/7-api-reference
chore/4-ci-setup
```

- `type` is one of `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.
- `short-name` is lowercase, hyphenated, 2–4 words.
- Branch from an up-to-date `main`: `git switch main && git pull && git switch -c feat/12-screening-ladder`.
- If there is no issue number for the task, ask for one before creating the branch.
- Commit messages: imperative and short, ending with the issue, e.g. `Add ladder step logic (#12)`.
- One sub-issue per branch, one branch per PR.

### Every PR closes an issue and is documented

- The PR body says `Closes #<sub-issue-number>`. A PR that closes no issue is not merged.
- Fill in the PR template completely: what changed, why, the requirement IDs, how to test
  it (exact steps), screenshots for UI, and any open question (Q-xx) it touches.
- Update the docs other people rely on, in the same PR: every endpoint must appear
  correctly in the Swagger UI (`/docs/api`, generated from code — use Form Requests and
  API Resources, plus a PHPDoc summary on the controller method), `client/README.md` for
  shared UI modules, README for setup changes.
- CI must be green and one reviewer from outside your area must approve.

## 2. Write minimal, clean code

- Do exactly what the ticket asks. No speculative features, no unrelated refactors.
- Prefer the simplest thing that works; delete before you add.
- Small functions with one job. Descriptive names over abbreviations (`lensPower`, not `lp`).
- No dead code, commented-out code or leftover `console.log` / `dd()`.
- Reuse existing helpers before writing new ones. Search first.
- No new dependency without a clear reason stated in the PR.
- Keep every number the screening uses in the protocol version, never hard-coded.

## 3. Comments: clear and purposeful

- Explain **why**, not what. The code already says what.
- Every non-obvious rule gets a comment with its requirement ID:
  ```js
  // S-62: orientation must come from a CSPRNG, never Math.random
  ```
- Public functions/classes get a short doc block (JSDoc in `client/`, PHPDoc in `server/`):
  purpose, params, return value.
- Formulas get the formula and units:
  ```js
  // S-53: height (mm) = 2 × distance (mm) × tan(angle / 2), angle = 5′ × 10^logMAR
  ```
- No noise comments (`// increment i`), no TODOs without an issue number (`// TODO(#45): ...`).

## 4. Best practices

**Security (X-08 to X-16)**
- Validate all input on the server (Laravel Form Requests). Never trust the client.
- Check role/ownership on every API request; a distributor never sees another's data.
- Eloquent / query builder only (prepared statements); no raw string-built SQL.
- Secrets live in `.env` / `.env.local` only. Never commit them. The Supabase
  **service role key never goes in `client/`** — only the anon key, via `VITE_` vars.

**Server (Laravel)**
- Thin controllers; business logic in service classes (e.g. `app/Screening/Scorer.php`).
- Every schema change is a migration. Never edit tables in the Supabase dashboard.
- Screenings and symbol records are append-only (S-107). Sync endpoints are idempotent (X-06).
- Write a feature test for every endpoint and a unit test for every scoring rule.
  Tests run on in-memory SQLite; they never touch Supabase.

**Client (vanilla JS)**
- ES modules, one feature per file under `src/`. No globals.
- Use `const`/`let`, `async`/`await`, `fetch`. Handle every error path the user can hit.
- Must work offline (D-36 to D-39): queue writes in IndexedDB, sync when online.
- Target Chrome for Android 100+ (X-17); keep first load small (X-18).

**Before you finish**
- `cd client && npm run build` passes.
- `cd server && php artisan test` passes.
- You ran the change and saw it work, not only the tests.

## 5. Use the right skills — especially for UI

If your agent supports skills/tools, load the relevant one **before** starting the work:

| Task | Use |
| --- | --- |
| Any UI screen or component | A design skill (e.g. `apple-design`, `design:design-critique`) to guide layout, hierarchy and spacing |
| Accessibility | `design:accessibility-review` — WCAG 2.1 AA, contrast, touch targets, screen readers |
| Button labels, errors, empty states | `design:ux-copy` |
| Animations, transitions, feedback | `motion-design` / `microinteractions` |
| Reviewing your own diff | `code-review`, `simplify` |
| Auth, input handling, secrets | `security-review` |

**UI rules for this product**
- Mobile first: design for a ~360px Android screen, then scale up (admin works 360–1920px, X-19).
- Big, clear touch targets (min 48px; answer arrows at least 64×64, S-45).
- Users may be older and have low literacy: short words, icons with labels, one task per screen.
- Always say "near vision screening", never "eye test". Never show a diagnosis (S-75).
- The screening test area is plain white with nothing else in it and no CSS scaling (S-14, S-57).
- Every screen has a loading, empty, error and offline state.
- Use semantic HTML (`button`, `label`, `main`, headings in order) before adding ARIA.

## 6. When unsure

Ask instead of guessing. Open questions in the requirements doc (Q-xx) are not decided:
don't invent an answer to one in code. Flag it in the PR instead.
