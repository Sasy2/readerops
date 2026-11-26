"use client";

import { Button } from "@/components/ui/Button";
import { Group, Row } from "@/components/ui/Group";
import { ScreenFrame } from "../components/ScreenFrame";
import type { StepProps } from "../flow";

const CARE = [
  { title: "Wash them every day", body: "Use soap and clean water." },
  { title: "Dry them gently", body: "Wipe with a clean, soft cloth." },
  { title: "Come back in about two years", body: "Eyes change. We will check again." },
];

/** Protocol step 9: walk the customer through looking after their glasses (S-91, S-92). */
export function AftercareStep({ end, step, totalSteps }: StepProps) {
  return (
    <ScreenFrame
      holder="distributor"
      step={step}
      totalSteps={totalSteps}
      title="Aftercare"
      subtitle="Show the customer how to look after their glasses."
      actions={
        <Button onClick={() => end("BUY", "fit_confirmed")}>
          Finish the screening
        </Button>
      }
    >
      <Group footer="The customer will also get these tips by SMS once sales are connected.">
        {CARE.map((item, i) => (
          <Row key={item.title} className="py-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-subhead font-semibold text-white">
              {i + 1}
            </span>
            <span className="flex flex-col">
              <span className="font-semibold">{item.title}</span>
              <span className="text-subhead text-label-secondary">{item.body}</span>
            </span>
          </Row>
        ))}
      </Group>
    </ScreenFrame>
  );
}
