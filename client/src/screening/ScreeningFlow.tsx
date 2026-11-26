"use client";

import { useEffect, useState, type ComponentType } from "react";
import { exitFullscreen } from "./device";
import { newRecord, type StepProps } from "./flow";
import { DEFAULT_PROTOCOL } from "./protocol";
import { AftercareStep } from "./steps/AftercareStep";
import { CalibrationStep } from "./steps/CalibrationStep";
import { CustomerStep } from "./steps/CustomerStep";
import { DistanceStep } from "./steps/DistanceStep";
import { EndScreen } from "./steps/EndScreen";
import { FitStep } from "./steps/FitStep";
import { HealthStep } from "./steps/HealthStep";
import { NearStep } from "./steps/NearStep";
import { ResultStep } from "./steps/ResultStep";
import { SetupStep } from "./steps/SetupStep";
import type { Calibration, ScreeningRecord } from "./types";

/**
 * The order of the screening (Test protocol §2). The cheap gates (health history, distance)
 * run before the near test, so a referral never wastes the customer's time.
 */
const STEPS: { name: string; Component: ComponentType<StepProps> }[] = [
  { name: "customer", Component: CustomerStep },
  { name: "calibration", Component: CalibrationStep },
  { name: "setup", Component: SetupStep },
  { name: "health", Component: HealthStep },
  { name: "distance", Component: DistanceStep },
  { name: "near", Component: NearStep },
  { name: "result", Component: ResultStep },
  { name: "fit", Component: FitStep },
  { name: "aftercare", Component: AftercareStep },
];

/**
 * Runs a full near vision screening on the phone, with no login and no server.
 * Protocol values come from the local default config.
 */
export function ScreeningFlow() {
  const protocol = DEFAULT_PROTOCOL;
  const [stepIndex, setStepIndex] = useState(0);
  const [record, setRecord] = useState<ScreeningRecord>(() => newRecord(protocol));
  const [calibration, setCalibration] = useState<Calibration | null>(null);
  const [ended, setEnded] = useState(false);

  // Leave fullscreen for the summary; EndScreen saves the screening.
  useEffect(() => {
    if (ended) void exitFullscreen();
  }, [ended]);

  const markStep = (index: number) =>
    setRecord((r) => ({ ...r, stepTimes: { ...r.stepTimes, [STEPS[index].name]: new Date().toISOString() } }));

  const props: StepProps = {
    protocol,
    record,
    calibration,
    setCalibration: (c) => {
      setCalibration(c);
      setRecord((r) => ({ ...r, calibration: c })); // S-09: the calibration travels with the screening
    },
    update: (patch) => setRecord((r) => ({ ...r, ...patch })),
    addSymbols: (runRecords) =>
      setRecord((r) => ({
        ...r,
        symbols: [...r.symbols, ...runRecords.map((s, i) => ({ ...s, sequence: r.symbols.length + i + 1 }))],
      })),
    next: () => {
      const nextIndex = stepIndex + 1;
      markStep(nextIndex);
      setStepIndex(nextIndex);
    },
    end: (outcome, reason) => {
      setRecord((r) => ({ ...r, endedAt: new Date().toISOString(), provisional: { outcome, reason } }));
      setEnded(true);
    },
    step: stepIndex + 1,
    totalSteps: STEPS.length,
  };

  if (ended) {
    return (
      <EndScreen
        record={record}
        onRestart={() => {
          setEnded(false);
          setRecord(newRecord(protocol));
          setStepIndex(0);
        }}
      />
    );
  }

  const { Component } = STEPS[stepIndex];
  return <Component {...props} />;
}
