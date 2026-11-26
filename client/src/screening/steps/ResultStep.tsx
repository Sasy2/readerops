"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Group, Row } from "@/components/ui/Group";
import { ScreenFrame } from "../components/ScreenFrame";
import type { StepProps } from "../flow";
import { CUSTOMER_MESSAGE } from "../outcomeText";
import { startingPower } from "../protocol";
import { ageOn, formatPower } from "../scoring";

/**
 * Protocol step 5: the provisional outcome, shown to the distributor (S-72 to S-76).
 * Labelled "pending check" because the server's result replaces it (S-73).
 */
export function ResultStep({ protocol, record, update, next, end, step, totalSteps }: StepProps) {
  const ladder = record.ladder;
  const smallest = ladder?.smallestPassedIndex ?? null;
  const power = startingPower(protocol, ageOn(record.customer.dateOfBirth));
  const impaired = smallest !== null && protocol.ladder[smallest].logMAR > protocol.impairmentLogMAR;

  // Outcomes that need no decision from the distributor end straight away.
  useEffect(() => {
    if (ladder?.stopReason === "incomplete_render") end("INCOMPLETE", "incomplete_render");
    else if (smallest === null) end("REFER", "no_level_passed");
  }, [end, ladder?.stopReason, smallest]);

  if (smallest === null || ladder?.stopReason === "incomplete_render") return null;

  const frame = { holder: "distributor" as const, step, totalSteps };

  if (!impaired) {
    // S-76: no sale is offered.
    return (
      <ScreenFrame
        {...frame}
        title="No reading glasses needed"
        actions={
          <Button onClick={() => end("NO_CORRECTION_NEEDED", "not_impaired")}>
            Finish the screening
          </Button>
        }
      >
        <PendingCheck />
        <SayToCustomer text={CUSTOMER_MESSAGE.none} />
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame
      {...frame}
      title="Reading glasses may help"
      actions={
        <Button
          onClick={() => {
            update({ recommendedPower: power });
            next();
          }}
        >
          Find the right power
        </Button>
      }
    >
      <PendingCheck />
      <Group>
        <Row>
          <span>Reason</span>
          <span className="ml-auto text-label-secondary">Small print is hard to read</span>
        </Row>
        <Row>
          <span>Starting power</span>
          <span className="ml-auto text-title2 font-bold text-accent">{formatPower(power)}</span>
        </Row>
      </Group>
      <SayToCustomer text={CUSTOMER_MESSAGE.benefit} />
    </ScreenFrame>
  );
}

/** S-73: every provisional outcome says it still needs the server's check. */
export function PendingCheck() {
  return (
    <p className="w-fit rounded-full bg-[#fff4e5] px-3 py-1 text-footnote font-semibold text-pending">
      Pending check
    </p>
  );
}

/** The exact words the distributor says to the customer (S-75). */
export function SayToCustomer({ text }: { text: string }) {
  return (
    <figure className="flex flex-col gap-1.5">
      <figcaption className="px-4 text-footnote text-label-secondary">Tell the customer</figcaption>
      <blockquote className="rounded-[var(--radius-card)] bg-card px-4 py-4 text-title2 font-semibold">{text}</blockquote>
    </figure>
  );
}
