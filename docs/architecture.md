# Architecture

```
  Distributor PWA            Laravel REST API          Supabase (Postgres)
  own Android phone  ---->   auth and roles    ---->   screenings (append only)
  calibrated chart           server scoring            customers, stock by power
  guided protocol            idempotent sync           commissions, referrals
  offline queue
                                  ^
                                  |
                            Admin dashboard
                            browser, online
```

## The rule everything else follows

**The client observes. The server decides.**

The phone records what symbol was shown and what the customer answered. It sends
those raw trials. The server recomputes correctness, applies the pass rule, finds
the threshold, checks it against the protocol, and returns the outcome.

If the phone could send a result, a distributor could send any result, and the
link between a verified screening and a commission would be decoration. That link
is the product.

## Offline and sync

- Queue in IndexedDB, replay on reconnect
- Every record carries a client-minted UUID and an `idempotency_key`
- The server stores the key UNIQUE and returns the original record on a repeat
- A sale that would take stock negative is accepted and flagged, never silently
  dropped, because the glasses are already in the customer's hands

## Security

- PDO prepared statements everywhere, no exceptions
- CSRF token on every state-changing form
- `password_hash` / `password_verify`, never a homemade hash
- Role checked server-side on every request, never inferred from the UI
- Account lock after repeated failed logins
- `screenings`, `screening_trials` and `audit_log` are append only, enforced by
  database grants rather than by remembering not to write an UPDATE
