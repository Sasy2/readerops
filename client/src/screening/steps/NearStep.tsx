"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScreenFrame } from "../components/ScreenFrame";
import { SymbolRun, type RunResult } from "../components/SymbolRun";
import type { StepProps } from "../flow";
import { nextLadderState, startLadder, type LadderState } from "../ladder";
import { countCorrect } from "../scoring";

type Stage = "handover" | "string" | "practice" | "ready" | "ladder" | "handback";

/**
 * Protocol step 4: the near test. The customer holds the phone at 40 cm with the string
 * pulled tight (S-38 to S-70).
 */
export function NearStep({ protocol, calibration, update, addSymbols, next, step, totalSteps }: StepProps) {
  const [stage, setStage] = useState<Stage>("handover");
  const [practiceRounds, setPracticeRounds] = useState(0);
  const [ladder, setLadder] = useState<LadderState>(() => startLadder(protocol));
  const frame = { step, totalSteps };

  if (!calibration) return null;

  const finishPractice = (records: RunResult) => {
    // S-43: practice answers are stored, marked as practice, and never counted.
    addSymbols(records);
    const rounds = practiceRounds + 1;
    setPracticeRounds(rounds);
    // S-44: repeat the practice once when fewer than 2 of 3 are correct.
    if (countCorrect(records) < protocol.practice.passMark && rounds < 2) return;
    setStage("ready");
  };

  const finishLevel = (records: RunResult) => {
    addSymbols(records);
    const state = nextLadderState(protocol, ladder, countCorrect(records), calibration);
    setLadder(state);
    if (state.done) {
      update({ ladder: { smallestPassedIndex: state.smallestPassedIndex, stopReason: state.stopReason ?? "" } });
      setStage("handback");
    }
  };

  switch (stage) {
    case "handover": // S-38
      return (
        <ScreenFrame
          {...frame}
          holder="handover"
          title="Give the phone to the customer"
          subtitle="They hold it for the near test."
          actions={
            <Button variant="inverse" onClick={() => setStage("string")}>
              The customer has the phone
            </Button>
          }
        />
      );

    case "string": // S-39, S-40, S-41
      return (
        <ScreenFrame
          {...frame}
          holder="customer"
          title="Hold the phone like this"
          actions={
            <Button
              onClick={() => {
                update({ nearStringConfirmed: true });
                setStage("practice");
              }}
            >
              The string is tight
            </Button>
          }
        >
          <ul className="flex list-disc flex-col gap-3 pl-6 text-title2">
            <li>Hold the end of the string to your cheek and pull it tight.</li>
            <li>Keep both eyes open.</li>
            <li>Wear your glasses if you already use some.</li>
          </ul>
        </ScreenFrame>
      );

    case "practice": // S-42
      return (
        <ScreenFrame {...frame} holder="customer" title="Practice" subtitle="Swipe the way the E points.">
          <SymbolRun
            key={`practice-${practiceRounds}`}
            protocol={protocol}
            calibration={calibration}
            count={protocol.practice.symbols}
            levelIndex={protocol.practice.levelIndex}
            logMAR={protocol.ladder[protocol.practice.levelIndex].logMAR}
            distanceMm={protocol.nearDistanceMm}
            meta={{ phase: "practice", n: protocol.ladder[protocol.practice.levelIndex].n }}
            unseenLabel="I can't see it"
            showHint={practiceRounds === 0}
            onDone={finishPractice}
          />
        </ScreenFrame>
      );

    case "ready":
      return (
        <ScreenFrame
          {...frame}
          holder="customer"
          title="Now the real check"
          actions={<Button onClick={() => setStage("ladder")}>Start</Button>}
        >
          <p className="text-title2">
            The symbols will get smaller. Keep the string tight. If you can&apos;t see one, tap &ldquo;I can&apos;t
            see it&rdquo;.
          </p>
        </ScreenFrame>
      );

    case "ladder": {
      const level = protocol.ladder[ladder.levelIndex];
      return (
        <ScreenFrame {...frame} holder="customer" title="Which way?" subtitle="Swipe the way the E points.">
          <SymbolRun
            key={`level-${ladder.levelIndex}-${ladder.direction}`}
            protocol={protocol}
            calibration={calibration}
            count={protocol.symbolsPerLevel}
            levelIndex={ladder.levelIndex}
            logMAR={level.logMAR}
            distanceMm={protocol.nearDistanceMm}
            meta={{ phase: "near", n: level.n }}
            unseenLabel="I can't see it"
            onDone={finishLevel}
          />
        </ScreenFrame>
      );
    }

    case "handback": // S-71
      return (
        <ScreenFrame
          {...frame}
          holder="handover"
          title="Give the phone back"
          subtitle="The distributor continues from here."
          actions={
            <Button variant="inverse" onClick={next}>
              The distributor has the phone
            </Button>
          }
        />
      );
  }
}
