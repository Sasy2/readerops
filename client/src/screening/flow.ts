/**
 * The step contract every screening step follows (ticket #68).
 * A step reads the shared record, patches it, and either moves on (`next`) or ends the
 * screening with a provisional outcome (`end`).
 */
import type { Protocol } from "./protocol";
import type { RunResult } from "./components/SymbolRun";
import type { Calibration, Outcome, OutcomeReason, ScreeningRecord } from "./types";

export type StepProps = {
  protocol: Protocol;
  record: ScreeningRecord;
  calibration: Calibration | null;
  setCalibration: (calibration: Calibration) => void;
  update: (patch: Partial<ScreeningRecord>) => void;
  /** Append raw symbol records; sequence numbers are assigned here. */
  addSymbols: (records: RunResult) => void;
  next: () => void;
  end: (outcome: Outcome, reason: OutcomeReason) => void;
  /** Used by every screen's step indicator. */
  step: number;
  totalSteps: number;
};

/**
 * An empty record. Its ids and start time are filled in by `startScreening` when the
 * distributor starts, not during render (Next.js prerenders pages, and random values
 * there would differ between server and browser).
 */
export function newRecord(protocol: Protocol): ScreeningRecord {
  return {
    id: "",
    idempotencyKey: "",
    protocolVersion: protocol.version,
    customer: { name: "", dateOfBirth: "", sex: "female" },
    calibration: null,
    startedAt: "",
    stepTimes: {},
    brightnessConfirmed: false,
    ambientLux: "unknown",
    distanceStringConfirmed: false,
    nearStringConfirmed: false,
    redFlagAnswers: [],
    symbols: [],
    ladder: null,
    fitAttempts: [],
    recommendedPower: null,
    chosenPower: null,
    provisional: null,
  };
}

/** S-70: a phone-generated id and idempotency key, created when the screening starts. */
export function startScreening(): Pick<ScreeningRecord, "id" | "idempotencyKey" | "startedAt"> {
  return { id: crypto.randomUUID(), idempotencyKey: crypto.randomUUID(), startedAt: new Date().toISOString() };
}
