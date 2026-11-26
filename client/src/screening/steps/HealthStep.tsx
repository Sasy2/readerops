"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScreenFrame } from "../components/ScreenFrame";
import type { StepProps } from "../flow";
import { ageOn } from "../scoring";

/**
 * Protocol steps 1–2 (Test protocol §2, S-20 to S-26): the age gate, then the health
 * history. People with diabetes, high blood pressure, thyroid disease, rheumatoid
 * arthritis or a known eye disease always need an eye health check, so any Yes ends the
 * screening as a referral before any vision check runs.
 * One question per screen with one large Yes and one large No (S-23).
 */
export function HealthStep({ protocol, record, update, next, end, step, totalSteps }: StepProps) {
  const [index, setIndex] = useState(0);
  const age = ageOn(record.customer.dateOfBirth);
  const blockedByAge = protocol.ageGate && age < protocol.minAge;

  // S-21, S-22: the age gate (when switched on) ends the screening before any question.
  useEffect(() => {
    if (!protocol.ageGate) return;
    if (age < 18) end("BLOCKED", "under_18");
    else if (age < protocol.minAge) end("REFER", "below_min_age");
  }, [age, end, protocol.ageGate, protocol.minAge]);

  if (blockedByAge) return null;

  const question = protocol.redFlags[index];

  const answer = (yes: boolean) => {
    const redFlagAnswers = [...record.redFlagAnswers, { question, answer: yes }];
    update({ redFlagAnswers });
    // S-25, S-26: the first Yes ends the screening as REFER; the question is kept for the referral.
    if (yes) return end("REFER", "red_flag");
    if (index + 1 < protocol.redFlags.length) setIndex(index + 1);
    else next();
  };

  return (
    <ScreenFrame
      holder="distributor"
      step={step}
      totalSteps={totalSteps}
      title="Health history"
      subtitle={`Ask the customer. Question ${index + 1} of ${protocol.redFlags.length}.`}
      actions={
        // Equal answers share one style (HIG buttons.md): neither is the "preferred" choice.
        <div className="grid grid-cols-2 gap-3">
          <Button variant="tinted" className="min-h-16 text-title2" onClick={() => answer(true)}>
            Yes
          </Button>
          <Button variant="tinted" className="min-h-16 text-title2" onClick={() => answer(false)}>
            No
          </Button>
        </div>
      }
    >
      <p className="rounded-[var(--radius-card)] bg-card px-5 py-6 text-large-title font-bold" aria-live="polite">
        {question}
      </p>
    </ScreenFrame>
  );
}
