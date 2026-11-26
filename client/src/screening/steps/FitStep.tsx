"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Group, Row } from "@/components/ui/Group";
import { ScreenFrame } from "../components/ScreenFrame";
import { SymbolRun, type RunResult } from "../components/SymbolRun";
import type { StepProps } from "../flow";
import { countCorrect, formatPower } from "../scoring";
import type { Clarity, FitAttempt } from "../types";

type Decision = { kind: "fit" } | { kind: "try"; power: number } | { kind: "no_fit" };

type Stage =
  | { kind: "power" }
  | { kind: "handover" }
  | { kind: "string" }
  | { kind: "run" }
  | { kind: "clarity"; passed: boolean }
  | { kind: "handback"; decision: Decision }
  | { kind: "decision"; decision: Decision };

const STEP = 0.5; // S-83

const CLARITY: { value: Clarity; label: string }[] = [
  { value: "closer", label: "Closer than the string" },
  { value: "at", label: "At the string" },
  { value: "farther", label: "Farther than the string" },
];

/**
 * Protocol steps 6–8: starting power and trial fit (S-77 to S-90).
 * Stock is not connected yet, so every power counts as in stock.
 */
export function FitStep({ protocol, calibration, record, update, addSymbols, next, end, step, totalSteps }: StepProps) {
  const [power, setPower] = useState(record.recommendedPower ?? protocol.powerRange.min);
  const [attempts, setAttempts] = useState<FitAttempt[]>([]);
  const [stage, setStage] = useState<Stage>({ kind: "power" });
  const frame = { step, totalSteps };

  if (!calibration) return null;
  const level = protocol.ladder[protocol.fitCheckLevelIndex];

  const decide = (passed: boolean, clarity: Clarity) => {
    const tried = [...attempts, { power, clarity }];
    setAttempts(tried);
    update({ fitAttempts: tried }); // S-85: every power tried, with the clarity answer

    let decision: Decision;
    if (passed && clarity === "at") {
      decision = { kind: "fit" }; // S-86
    } else {
      // S-83: "farther" means too weak, "closer" means too strong.
      const nextPower = clarity === "closer" ? power - STEP : power + STEP;
      const inRange = nextPower >= protocol.powerRange.min && nextPower <= protocol.powerRange.max;
      const alreadyTried = tried.some((a) => a.power === nextPower);
      decision = inRange && !alreadyTried ? { kind: "try", power: nextPower } : { kind: "no_fit" }; // S-87
    }
    setStage({ kind: "handback", decision });
  };

  switch (stage.kind) {
    case "power": // S-79, S-80
      return (
        <ScreenFrame
          {...frame}
          holder="distributor"
          title={`Try ${formatPower(power)}`}
          subtitle="Put this trial pair on the customer, then give them the phone."
          actions={
            <>
              <Button onClick={() => setStage({ kind: "handover" })}>
                The trial pair is on
              </Button>
              <Button
                variant="tinted"
                onClick={() => {
                  update({ recommendedPower: record.recommendedPower ?? power });
                  end("BUY", "walk_away"); // S-88
                }}
              >
                I don&apos;t have this power
              </Button>
            </>
          }
        >
          <Group>
            <Row>
              <span>Trial power</span>
              <span className="ml-auto font-semibold">{formatPower(power)}</span>
            </Row>
            <Row>
              <span>In your stock</span>
              <span className="ml-auto font-semibold text-clear">Yes</span>
            </Row>
          </Group>
        </ScreenFrame>
      );

    case "handover":
      return (
        <ScreenFrame
          {...frame}
          holder="handover"
          title="Give the phone to the customer"
          subtitle="They wear the trial pair for this check."
          actions={
            <Button variant="inverse" onClick={() => setStage({ kind: "string" })}>
              The customer has the phone
            </Button>
          }
        />
      );

    case "string":
      return (
        <ScreenFrame
          {...frame}
          holder="customer"
          title="Wear the trial glasses"
          actions={<Button onClick={() => setStage({ kind: "run" })}>The string is tight</Button>}
        >
          <p className="text-title2">Hold the string to your cheek and pull it tight, like before.</p>
        </ScreenFrame>
      );

    case "run": // S-81
      return (
        <ScreenFrame {...frame} holder="customer" title="Which way?" subtitle="Swipe the way the E points.">
          <SymbolRun
            key={`fit-${power}`}
            protocol={protocol}
            calibration={calibration}
            count={protocol.symbolsPerLevel}
            levelIndex={protocol.fitCheckLevelIndex}
            logMAR={level.logMAR}
            distanceMm={protocol.nearDistanceMm}
            meta={{ phase: "fit", n: level.n, lensPower: power }}
            unseenLabel="I can't see it"
            onDone={(records: RunResult) => {
              addSymbols(records);
              setStage({ kind: "clarity", passed: countCorrect(records) >= protocol.passMark });
            }}
          />
        </ScreenFrame>
      );

    case "clarity": // S-82
      return (
        <ScreenFrame
          {...frame}
          holder="customer"
          title="Where is it clearest?"
          subtitle="Move the phone closer and farther, then choose."
        >
          <div className="flex flex-col gap-3">
            {/* Equal choices share one style (HIG buttons.md: style, not size, marks a preference). */}
            {CLARITY.map(({ value, label }) => (
              <Button key={value} variant="tinted" className="min-h-16 text-title2" onClick={() => decide(stage.passed, value)}>
                {label}
              </Button>
            ))}
          </div>
        </ScreenFrame>
      );

    case "handback":
      return (
        <ScreenFrame
          {...frame}
          holder="handover"
          title="Give the phone back"
          subtitle="The distributor continues from here."
          actions={
            <Button variant="inverse" onClick={() => setStage({ kind: "decision", decision: stage.decision })}>
              The distributor has the phone
            </Button>
          }
        />
      );

    case "decision": {
      const { decision } = stage;
      if (decision.kind === "fit") {
        return (
          <ScreenFrame
            {...frame}
            holder="distributor"
            title={`${formatPower(power)} fits`}
            subtitle="The customer read clearly at the string length with this pair."
            actions={
              <Button
                onClick={() => {
                  update({ chosenPower: power }); // S-89
                  next();
                }}
              >
                Continue to aftercare
              </Button>
            }
          />
        );
      }
      if (decision.kind === "try") {
        return (
          <ScreenFrame
            {...frame}
            holder="distributor"
            title={`Try ${formatPower(decision.power)} next`}
            subtitle={`${formatPower(power)} didn't give clear reading at the string length.`}
            actions={
              <Button
                onClick={() => {
                  setPower(decision.power);
                  setStage({ kind: "power" });
                }}
              >
                Use {formatPower(decision.power)}
              </Button>
            }
          />
        );
      }
      return (
        <ScreenFrame
          {...frame}
          holder="distributor"
          title="No power fitted"
          subtitle={`Tried ${attempts.map((a) => formatPower(a.power)).join(", ")}. Refer the customer to an eye care professional.`}
          actions={
            <Button onClick={() => end("REFER", "no_fit")}>
              Finish the screening
            </Button>
          }
        />
      );
    }
  }
}
