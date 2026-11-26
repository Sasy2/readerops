import type { Direction } from "./optotype";

export type Sex = "female" | "male";

export type Customer = { name: string; dateOfBirth: string; sex: Sex };

/** S-04: everything we store about a calibration. */
export type Calibration = {
  pxPerMm: number;
  dpr: number;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
  calibratedAt: string;
  /** S-07: smallest ladder index this device can draw above the render floor. */
  smallestDrawableIndex: number;
};

/** Both eyes are open together for every check (Test protocol §2 steps 3–4). */
export type Eye = "both";
export type Phase = "distance" | "practice" | "near" | "fit";

/**
 * S-36, S-68: one raw symbol record. It never contains a correctness value or an
 * outcome (S-69): the server recomputes those.
 */
export type SymbolRecord = {
  sequence: number;
  phase: Phase;
  levelIndex: number;
  n: string;
  logMAR: number;
  eye?: Eye;
  pinhole?: boolean;
  lensPower?: number;
  shown: Direction;
  /** null means the symbol was not seen ("I can't see it" or the unseen timeout). */
  answered: Direction | null;
  responseMs: number;
  strokeDevicePx: number;
  timestamp: string;
};

export type Outcome = "BUY" | "REFER" | "BLOCKED" | "NO_CORRECTION_NEEDED" | "INCOMPLETE";

export type OutcomeReason =
  | "under_18"
  | "below_min_age"
  | "red_flag"
  | "distance_va"
  | "no_level_passed"
  | "incomplete_render"
  | "outside_age_table"
  | "no_fit"
  | "walk_away"
  | "fit_confirmed"
  | "not_impaired";

export type Clarity = "closer" | "at" | "farther";

export type FitAttempt = { power: number; clarity: Clarity | null };

/** Everything one screening produces, saved on the phone (S-70). */
export type ScreeningRecord = {
  id: string;
  idempotencyKey: string;
  protocolVersion: string;
  customer: Customer;
  calibration: Calibration | null;
  startedAt: string;
  endedAt?: string;
  /** Step name → ISO time it started. */
  stepTimes: Record<string, string>;
  brightnessConfirmed: boolean;
  ambientLux: number | "unknown";
  distanceStringConfirmed: boolean;
  nearStringConfirmed: boolean;
  redFlagAnswers: { question: string; answer: boolean }[];
  symbols: SymbolRecord[];
  /** Where the near ladder stopped (provisional; the server recomputes it). */
  ladder: { smallestPassedIndex: number | null; stopReason: string } | null;
  fitAttempts: FitAttempt[];
  recommendedPower: number | null;
  chosenPower: number | null;
  /** Provisional, shown as "pending check" until the server confirms (S-73). */
  provisional: { outcome: Outcome; reason: OutcomeReason } | null;
};
