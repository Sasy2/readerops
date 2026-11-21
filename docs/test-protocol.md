# Test protocol

The full clinical specification, the standards behind every number, the decision
flow, and the reasoning lives in the team document:

**ReaderOps — CS341 Team Project Proposal → "Test protocol" tab**

This file records only what a developer needs at the keyboard. If the two ever
disagree, the team document wins and this file is wrong.

## Constants

| Constant | Value | Source |
| --- | --- | --- |
| Optotype | Tumbling E, 4 orientations, crowding bar | PeekNV (TVST 2022) |
| Grid | 5 x 5, stroke = 1/5 of height | ISO 8596:2017 |
| Gap tolerance | 5% permissible deviation | ISO 8596:2017 |
| Presentations per level | 5 | ISO 8596:2017 (at least 5) |
| Pass rule | 3 of 5 correct | Line scoring |
| Test distance | 400 mm | WHO / PeekNV |
| Fail threshold | Worse than N6, about 0.27 logMAR | WHO / ICD-11 |
| Calibration reference | ID-1 card, 85.60 mm | ISO/IEC 7810 |
| Distance VA gate | Refer at 6/12 or worse | CEH Journal 2019 |
| Fit failure | Refer if cannot read N10 at any power | CEH Journal 2006 |

These live in `protocol_versions`, not in code. Read them from the active row.

## Sanity checks for your implementation

At logMAR 0.0 the E is **0.58 mm** tall, stroke **0.116 mm**.
At N6 (0.27 logMAR) the E is **1.08 mm** tall, stroke **0.217 mm**.

If your geometry function does not produce those numbers, it is wrong. Stop and
fix it before building anything on top.

## The one trap

That 0.217 mm stroke is about 3.4 pixels on a 400 ppi screen. Rounded to whole
pixels you are 12 to 17 percent out, three times outside what ISO 8596 permits.

Therefore: anti-aliased SVG with fractional coordinates, never a bitmap, never
integer rounding, and refuse to run on a device below the minimum stroke width
in `protocol_versions.min_stroke_px`.

## References

- ISO 8596:2017 — https://standards.iteh.ai/catalog/standards/cen/abef1947-8128-4f44-9f21-7315da6750f8/en-iso-8596-2018
- WHO World report on vision — https://www.who.int/docs/default-source/documents/publications/world-vision-report-accessible.pdf
- PeekNV validation, TVST 2022 — https://tvst.arvojournals.org/article.aspx?articleid=2785243
- Prescribing for presbyopia, CEH Journal 2006 — https://archive.cehjournal.org/?p=2494
- Prescribing for near vision, CEH Journal 2019 — https://archive.cehjournal.org/?p=29694
- Peek Acuity calibration note — https://peekvision.org/solutions/peek-acuity/peek-acuity-calibration/
