"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Group, Row } from "@/components/ui/Group";
import { Toggle } from "@/components/ui/Toggle";
import { ScreenFrame } from "../components/ScreenFrame";
import { enterFullscreen, keepScreenAwake, lockPortrait } from "../device";
import type { StepProps } from "../flow";

/**
 * Screen setup before every screening (S-10 to S-15).
 * A web page cannot set brightness, so the distributor confirms it (S-13).
 */
export function SetupStep({ update, next, step, totalSteps }: StepProps) {
  const [brightness, setBrightness] = useState(false);

  const start = async () => {
    // These need the tap that just happened, so they run before anything else.
    await enterFullscreen();
    await lockPortrait();
    await keepScreenAwake();
    // S-15: no light sensor reading in the browser yet, so lux is recorded as unknown.
    update({ brightnessConfirmed: true, ambientLux: "unknown" });
    next();
  };

  return (
    <ScreenFrame
      holder="distributor"
      step={step}
      totalSteps={totalSteps}
      title="Get ready"
      subtitle="The screen goes fullscreen and stays on until you finish."
      actions={
        <Button disabled={!brightness} onClick={start}>
          Start the screening
        </Button>
      }
    >
      <Group header="Before you start">
        <Row>Find shade, out of direct sunlight.</Row>
        <Row>Have the 3 m string, the 40 cm string and your trial pairs.</Row>
      </Group>
      <Group footer="A web page can't change brightness, so set it yourself in the phone's quick settings.">
        <Toggle label="Brightness is at maximum" checked={brightness} onChange={setBrightness} />
      </Group>
    </ScreenFrame>
  );
}
