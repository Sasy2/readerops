## What this changes

<!-- One or two sentences. What is different after this merges? -->

## Why

<!-- Link the issue: Fixes #___ -->

## How to test it

<!-- Steps a reviewer follows to see it work. Be specific. -->

1.
2.

## Checklist

- [ ] Every new query uses a prepared statement
- [ ] Any state-changing form has a CSRF token
- [ ] No screening outcome is decided on the client
- [ ] `database/schema.sql` updated if the schema changed
- [ ] No `.env`, key, or real customer data in this diff
- [ ] I can explain every line of this in the viva
