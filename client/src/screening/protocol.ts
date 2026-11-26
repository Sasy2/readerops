/**
 * Default near vision screening protocol (v1.0.0).
 *
 * Every number the screening uses lives here, never in components (A-68 to A-83).
 * Later this comes from the server's active protocol version; for the standalone
 * /test route we use these defaults.
 */

export type LadderLevel = { n: string; logMAR: number };
export type AgePower = { from: number; to: number; power: number };

export type Protocol = {
  version: string;
  /** A-08 / Q-02: minimum customer age for screening. */
  minAge: number;
  /**
   * S-21, S-22: block under 18 and refer under `minAge`. Switched off for now so testers of
   * any age can run the flow; it must be on before real screening.
   */
  ageGate: boolean;
  /** A-69, S-59: largest to smallest. */
  ladder: LadderLevel[];
  /** A-70, S-61 */
  symbolsPerLevel: number;
  /** A-71, S-63 */
  passMark: number;
  /** A-72: worse (higher) than this logMAR counts as impaired. */
  impairmentLogMAR: number;
  /** A-73 */
  nearDistanceMm: number;
  /** ISO 8596: plain white test field extending at least this far beyond the symbol, in degrees. */
  testFieldMarginDeg: number;
  /** A-74, S-60: index into `ladder`. */
  startLevelIndex: number;
  /** A-75: thinnest stroke we trust the screen to draw, in device pixels. */
  renderFloorPx: number;
  /** A-76 */
  distanceCheckMm: number;
  /** A-77: 6/9 */
  distanceCheckLogMAR: number;
  /** A-78: lens powers a trial fit may use. */
  powerRange: { min: number; max: number };
  /** A-79, S-81: index into `ladder` (N10). */
  fitCheckLevelIndex: number;
  /** A-80 */
  minAnswerMs: number;
  /** A-11 */
  minScreeningMs: number;
  /** A-82 */
  plausiblePxPerMm: { min: number; max: number };
  /** A-09, S-77 */
  ageToPower: AgePower[];
  /** A-10, S-24 */
  redFlags: string[];
  /** S-42 */
  practice: { levelIndex: number; symbols: number; passMark: number };
};

export const DEFAULT_PROTOCOL: Protocol = {
  version: "1.0.0",
  minAge: 35,
  ageGate: false,
  ladder: [
    { n: "N64", logMAR: 1.3 },
    { n: "N50.4", logMAR: 1.19 },
    { n: "N40", logMAR: 1.09 },
    { n: "N32", logMAR: 1.0 },
    { n: "N25.6", logMAR: 0.9 },
    { n: "N20", logMAR: 0.79 },
    { n: "N16", logMAR: 0.7 },
    { n: "N12.8", logMAR: 0.6 },
    { n: "N10", logMAR: 0.49 },
    { n: "N8", logMAR: 0.4 },
    { n: "N6", logMAR: 0.27 },
    { n: "N3.2", logMAR: 0.0 },
  ],
  symbolsPerLevel: 5,
  passMark: 3,
  impairmentLogMAR: 0.27,
  nearDistanceMm: 400,
  testFieldMarginDeg: 0.5,
  startLevelIndex: 4,
  // Q-41 is open: the spec says 6, but no current phone draws N6 that thick. 3 is achievable.
  renderFloorPx: 3,
  distanceCheckMm: 3000,
  distanceCheckLogMAR: 0.18,
  powerRange: { min: 1.0, max: 3.0 },
  fitCheckLevelIndex: 8,
  minAnswerMs: 300,
  minScreeningMs: 20_000,
  plausiblePxPerMm: { min: 2, max: 25 },
  ageToPower: [
    { from: 35, to: 45, power: 1.0 },
    { from: 46, to: 50, power: 1.5 },
    { from: 51, to: 55, power: 2.0 },
    { from: 56, to: 120, power: 2.5 },
  ],
  redFlags: [
    "Do you have diabetes?",
    "Do you have high blood pressure?",
    "Do you have a thyroid problem?",
    "Do you have rheumatoid arthritis?",
    "Do you have any eye disease you know of?",
  ],
  practice: { levelIndex: 0, symbols: 3, passMark: 2 },
};

/**
 * S-77: the starting power comes from the age table, never from the test result.
 * S-78 (refer ages outside the table) is switched off for now: ages outside the table use
 * the nearest row, so testers of any age get a starting power.
 */
export function startingPower(protocol: Protocol, age: number): number {
  const table = protocol.ageToPower;
  const row = table.find((r) => age >= r.from && age <= r.to);
  if (row) return row.power;
  return age < table[0].from ? table[0].power : table[table.length - 1].power;
}
