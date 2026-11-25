Closes #<!-- sub-issue number. Every PR must close an issue. -->

**Area:** <!-- server / ui -->  **Requirements:** <!-- e.g. S-53, S-54 -->

## What this changes

<!-- One or two sentences. What is different after this merges? -->

## Why

<!-- The reason, in plain words. Link related issues or decisions. -->

## How to test it

<!-- Exact steps a reviewer follows to see it work. -->

1.
2.

## Screenshots (UI only)

<!-- Mobile (360px) and, for admin pages, desktop. -->

## Open questions touched

<!-- Q-xx from the requirements doc, or "none". Never decide an open question silently. -->

## Checklist

- [ ] Stays inside the ticket's scope (server ticket → only `server/`, UI ticket → only `client/`, plus docs)
- [ ] Tests added or updated, and CI is green
- [ ] Server: every new or changed endpoint appears correctly in Swagger (`/docs/api`)
- [ ] Docs updated (`client/README.md`, README) if others rely on this
- [ ] No screening outcome is decided on the client
- [ ] Schema changes are Laravel migrations (never edited in the Supabase dashboard)
- [ ] No `.env`, keys, or real customer data in this diff
- [ ] I can explain every line of this in the viva
