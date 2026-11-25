# Tickets without a GitHub assignee

Tickets whose owner has no GitHub access yet are recorded here, one file per issue
(`tickets/<issue-number>.md`). Once the person accepts the repo invite, assign them on
GitHub and delete the files (one command per file is written inside it, or run:)

```bash
for n in $(ls tickets | grep -E '^[0-9]+\.md$' | sed 's/.md//'); do
  gh issue edit "$n" -R Sasy2/readerops --add-assignee <favour-github-username>
done
```

## Favour (31 tickets, GitHub: not assigned)

| Issue | Type | Labels | Title |
| --- | --- | --- | --- |
| [#17](https://github.com/Sasy2/readerops/issues/17) | Epic | `server` `phase-2` | Admin API endpoints: distributors, regions, protocol, stock and credit |
| [#18](https://github.com/Sasy2/readerops/issues/18) | Sub | `server` `phase-2` | Audit log: Auditable trait and search endpoint |
| [#19](https://github.com/Sasy2/readerops/issues/19) | Sub | `server` `phase-2` | Regions: create, edit, list |
| [#20](https://github.com/Sasy2/readerops/issues/20) | Sub | `server` `phase-2` | Distributors: register, list, view, assign region |
| [#21](https://github.com/Sasy2/readerops/issues/21) | Sub | `server` `phase-2` | Distributors: training date, deactivate, reset PIN |
| [#22](https://github.com/Sasy2/readerops/issues/22) | Sub | `server` `phase-2` | Protocol versions: draft, edit, publish, history, active |
| [#23](https://github.com/Sasy2/readerops/issues/23) | Sub | `server` `phase-2` | Prices, commission and unit cost settings |
| [#24](https://github.com/Sasy2/readerops/issues/24) | Sub | `server` `phase-2` | Stock store: receive stock, totals, low-stock thresholds |
| [#25](https://github.com/Sasy2/readerops/issues/25) | Sub | `server` `phase-2` | Stock allocation to distributors |
| [#26](https://github.com/Sasy2/readerops/issues/26) | Sub | `server` `phase-2` | Stock returns and write-offs |
| [#27](https://github.com/Sasy2/readerops/issues/27) | Sub | `server` `phase-2` | Stock credit: repayments, balances, overdue flag |
| [#28](https://github.com/Sasy2/readerops/issues/28) | Sub | `server` `phase-2` | Referrals: list, assign, close |
| [#29](https://github.com/Sasy2/readerops/issues/29) | Sub | `server` `phase-2` | Customer data deletion |
| [#37](https://github.com/Sasy2/readerops/issues/37) | Epic | `server` `phase-3` | Distributor API endpoints: customers, own stock, credit and referrals |
| [#38](https://github.com/Sasy2/readerops/issues/38) | Sub | `server` `phase-3` | Customers: find by phone, register with consent, history |
| [#39](https://github.com/Sasy2/readerops/issues/39) | Sub | `server` `phase-3` | My stock and confirming allocations |
| [#40](https://github.com/Sasy2/readerops/issues/40) | Sub | `server` `phase-3` | Stock requests |
| [#41](https://github.com/Sasy2/readerops/issues/41) | Sub | `server` `phase-3` | My credit: balance, due dates, repayments |
| [#42](https://github.com/Sasy2/readerops/issues/42) | Sub | `server` `phase-3` | My referrals and follow-up outcomes |
| [#48](https://github.com/Sasy2/readerops/issues/48) | Epic | `server` `phase-4` | Commission statements, payouts and SMS |
| [#49](https://github.com/Sasy2/readerops/issues/49) | Sub | `server` `phase-4` | SMS service (log driver) and editable templates |
| [#50](https://github.com/Sasy2/readerops/issues/50) | Sub | `server` `phase-4` | SMS opt-out and scheduled reminders |
| [#51](https://github.com/Sasy2/readerops/issues/51) | Sub | `server` `phase-4` | Monthly commission statements |
| [#52](https://github.com/Sasy2/readerops/issues/52) | Sub | `server` `phase-4` | Payout CSV export and mark as paid |
| [#53](https://github.com/Sasy2/readerops/issues/53) | Epic | `server` `phase-5` | Analytics endpoints for the admin and distributor dashboards |
| [#54](https://github.com/Sasy2/readerops/issues/54) | Sub | `server` `phase-5` | Admin usage metrics |
| [#55](https://github.com/Sasy2/readerops/issues/55) | Sub | `server` `phase-5` | D-Prize metric set |
| [#56](https://github.com/Sasy2/readerops/issues/56) | Sub | `server` `phase-5` | Screening detail and quality-flag views |
| [#57](https://github.com/Sasy2/readerops/issues/57) | Sub | `server` `phase-5` | CSV export for metric views |
| [#58](https://github.com/Sasy2/readerops/issues/58) | Sub | `server` `phase-5` | Distributor stats |
| [#59](https://github.com/Sasy2/readerops/issues/59) | Sub | `server` `phase-5` | Demand-building activities log |
