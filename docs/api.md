# API reference

All endpoints return JSON. All state-changing calls require authentication and a
valid CSRF token. Roles are checked on the server for every request.

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | any | Phone + PIN, or email + password |
| POST | `/api/auth/logout` | any | End session |
| GET | `/api/protocol/active` | distributor | Current thresholds, ladder, power table |
| GET | `/api/customers?phone=` | distributor | Find a returning customer |
| POST | `/api/customers` | distributor | Register, requires recorded consent |
| POST | `/api/screenings` | distributor | Submit raw trials, server scores and returns outcome |
| POST | `/api/sales` | distributor | Only against a screening scored BUY |
| GET | `/api/stock/mine` | distributor | Own stock by lens power |
| POST | `/api/allocations/{id}/confirm` | distributor | Confirm receipt, enter quantities |
| GET | `/api/referrals/mine` | distributor | Open referrals assigned to me |
| POST | `/api/sync` | distributor | Batch replay of queued records |
| GET | `/api/metrics` | admin | Programme metrics, filterable |
| GET | `/api/flags` | admin | Quality flags |
| POST | `/api/protocol` | admin | Publish a version — reviewer name required |

## POST /api/screenings

The phone sends observations only. Note there is no `outcome` field in the request.

```json
{
  "id": "uuid",
  "idempotency_key": "uuid",
  "customer_id": 42,
  "age": 52,
  "red_flags": [],
  "distance_va_fails": false,
  "started_at": "2026-11-23T10:04:11Z",
  "completed_at": "2026-11-23T10:05:02Z",
  "calibration": { "pxPerMm": 11.4, "dpr": 3, "calibratedAt": "..." },
  "lux": 320,
  "distance_aid_used": true,
  "trials": [
    { "seq": 1, "level": 8, "logmar": 0.60, "shown": 90,
      "answer": 90, "ms": 1840, "strokePx": 9.2 }
  ]
}
```

Response:

```json
{
  "outcome": "BUY",
  "reason": "nvi_detected",
  "last_passed": 9,
  "recommended_power": 2.00,
  "protocol_version": "1.0.0",
  "flags": []
}
```
