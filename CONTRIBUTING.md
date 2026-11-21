# How we work on ReaderOps

Two weeks, five people, one grade. These rules exist so we never block each other.

## Branches

`main` is protected. No direct pushes, no exceptions, including the person who
set up the repository.

Branch names:

```
feat/<short-thing>     feat/screening-ladder
fix/<short-thing>      fix/sync-duplicate
docs/<short-thing>     docs/api-reference
```

## Pull requests

- One PR per task from the issue board. Small PRs get reviewed; large ones rot.
- Every PR needs **one approving review from someone outside your workstream**.
  This is not bureaucracy — it is how we all survive the viva, where any of us can
  be asked about any part of the code.
- Fill in the PR template. "Fixes #12" in the body closes the issue automatically.
- CI must be green before merge.

## The schema

`database/schema.sql` is the only place the database is defined. If you change a
table, change it there in the same PR. Never alter your local database without
putting the change in that file — on the Friday before the demo we will all rebuild
from it, and anything not in there is gone.

## Things that must never be committed

- `.env`, API keys, database passwords
- Real customer data of any kind
- Anything generated: `vendor/`, `node_modules/`, build output

If you commit a secret by accident, tell the group immediately. Rotating a key is
five minutes; a key sitting in git history for a week is a different problem.

## Code rules we actually enforce

- Every database query goes through a prepared statement. No exceptions, no string
  interpolation into SQL, ever.
- Every state-changing form carries a CSRF token.
- The server decides screening outcomes. The client sends observations only —
  never a result, never a boolean the server could have computed itself.
- `screenings` and `screening_trials` are append-only. No UPDATE, no DELETE.

## Commit messages

Present tense, says what changed:

```
Add server-side scoring for the trial ladder
Fix duplicate sale on retried sync
```

Not `update`, not `fixes`, not `asdf`.
