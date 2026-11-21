# Tests

Minimum set before the demo. Each maps to a requirement ID.

| Test | Requirement | Expected |
| --- | --- | --- |
| Screening with age 16 | D-10 | outcome BLOCKED, no sale possible |
| Any red flag answered yes | D-19, D-20 | outcome REFER, referral row created |
| Sale without a BUY screening | D-26, X-04 | rejected by the server |
| Same sync payload sent twice | X-06 | one sale, one commission, original returned |
| Distributor A reads distributor B's stock | X-01 | 403 |
| Screening on an uncalibrated device | D-05 | refused before the first trial |
| Client sends outcome=BUY with failing trials | X-03 | server overrides, outcome REFER |
| Geometry at logMAR 0 and 0.27 | — | 0.5818 / 0.1164 mm and 1.0833 / 0.2167 mm |

That last one is the cheapest high-value test in the project. Write it first.
