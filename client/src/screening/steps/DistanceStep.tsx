"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Group, Row } from "@/components/ui/Group";
import { Toggle } from "@/components/ui/Toggle";
import { ScreenFrame } from "../components/ScreenFrame";
import { SymbolRun, type RunResult } from "../components/SymbolRun";
import type { StepProps } from "../flow";
import { countCorrect } from "../scoring";

type Stage = { kind: "setup" } | { kind: "run"; pinhole: boolean } | { kind: "failed" };

/**
 * Protocol step 3: the distance vision gate at 3 m, with both eyes open together
 * (Test protocol §2 step 3, S-27 to S-37). Passing 3 of 5 symbols at 6/9 means distance
 * vision is 6/9 or better, so the screening can go on; otherwise the customer is referred.
 * The distributor holds the phone and taps the way the customer points.
 */
export function DistanceStep({ protocol, calibration, update, addSymbols, next, end, step, totalSteps }: StepProps) {
  const [stage, setStage] = useState<Stage>({ kind: "setup" });
  const [stringConfirmed, setStringConfirmed] = useState(false);
  const frame = { holder: "distributor" as const, step, totalSteps };

  if (!calibration) return null; // S-06: unreachable, the calibration step comes first

  const finish = (pinhole: boolean, records: RunResult) => {
    addSymbols(records);
    if (countCorrect(records) >= protocol.passMark) next();
    else if (!pinhole) setStage({ kind: "failed" });
    else end("REFER", "distance_va"); // S-37: no better than 6/9 even with the pinhole
  };

  if (stage.kind === "setup") {
    return (
      <ScreenFrame
        {...frame}
        title="Distance check"
        subtitle="Both eyes open, from 3 metres."
        actions={
          <Button
            disabled={!stringConfirmed}
            onClick={() => {
              update({ distanceStringConfirmed: true });
              setStage({ kind: "run", pinhole: false });
            }}
          >
            Start the distance check
          </Button>
        }
      >
        <Group header="How to do it">
          {[
            "Stretch the 3 m string between you and the customer.",
            "Hold the phone at the customer's eye height, screen facing them.",
            "The customer keeps both eyes open and wears any glasses they already use.",
            "The customer points the way the E's arms point. You swipe that way on the white area.",
          ].map((text, i) => (
            <Row key={text}>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-footnote font-semibold text-white">
                {i + 1}
              </span>
              {text}
            </Row>
          ))}
        </Group>
        {/* S-28: the check cannot start until the string is confirmed. */}
        <Group>
          <Toggle label="The 3 m string is in place" checked={stringConfirmed} onChange={setStringConfirmed} />
        </Group>
      </ScreenFrame>
    );
  }

  if (stage.kind === "failed") {
    // S-35 (Should), CEH 2006: one retry through the pinhole card before referring.
    return (
      <ScreenFrame
        {...frame}
        title="Try the pinhole card"
        subtitle="Hold the pinhole card close to the customer's eyes. They look through the small hole."
        actions={
          <>
            <Button onClick={() => setStage({ kind: "run", pinhole: true })}>Retry with the pinhole card</Button>
            <Button variant="tinted" onClick={() => end("REFER", "distance_va")}>
              Skip the retry
            </Button>
          </>
        }
      />
    );
  }

  return (
    <ScreenFrame
      {...frame}
      holder="customer"
      title="Which way?"
      subtitle={stage.pinhole ? "Through the pinhole card, both eyes open." : "Both eyes open."}
    >
      <SymbolRun
        key={`distance-${stage.pinhole}`}
        protocol={protocol}
        calibration={calibration}
        count={protocol.symbolsPerLevel}
        levelIndex={-1}
        logMAR={protocol.distanceCheckLogMAR}
        distanceMm={protocol.distanceCheckMm}
        meta={{ phase: "distance", n: "6/9", eye: "both", pinhole: stage.pinhole }}
        unseenLabel="Can't see"
        onDone={(records) => finish(stage.pinhole, records)}
      />
    </ScreenFrame>
  );
}
