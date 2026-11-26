"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Group, Row } from "@/components/ui/Group";
import { TopModal } from "@/components/ui/TopModal";
import {
  buildCalibration,
  canDrawN6,
  CARD_CORNER_MM,
  CARD_LONG_MM,
  CARD_SHORT_MM,
  loadCalibration,
  pxPerMmFromCardLength,
  saveCalibration,
} from "../calibration";
import { ScreenFrame } from "../components/ScreenFrame";
import type { StepProps } from "../flow";
import type { Calibration } from "../types";

/** A first guess at the card's length: most phones show about 6 CSS px per mm. */
const GUESS_PX = CARD_LONG_MM * 6;
const MIN_PX = 150;

/**
 * Step 0: match an on-screen outline to a real bank card (S-01 to S-09).
 * A valid stored calibration is reused; S-06 means there is no way past this step without one.
 */
export function CalibrationStep({ protocol, setCalibration, next, step, totalSteps }: StepProps) {
  // This step only mounts after the customer step, in the browser, so localStorage exists.
  const [stored] = useState<Calibration | null>(loadCalibration);
  const [recalibrating, setRecalibrating] = useState(false);
  // The outline's long side (down the screen), in CSS px. The short side follows from it.
  const [lengthPx, setLengthPx] = useState(GUESS_PX);
  const [problem, setProblem] = useState<{ title: string; message: string } | null>(null);
  const dragStart = useRef<{ x: number; y: number; length: number } | null>(null);

  const frame = { holder: "distributor" as const, step, totalSteps };

  if (stored && !recalibrating) {
    return (
      <ScreenFrame
        {...frame}
        title="Phone calibrated"
        subtitle={`Calibrated on ${new Date(stored.calibratedAt).toLocaleDateString()}.`}
        actions={
          <>
            <Button
              onClick={() => {
                setCalibration(stored);
                next();
              }}
            >
              Continue
            </Button>
            <Button variant="tinted" onClick={() => setRecalibrating(true)}>
              Calibrate again
            </Button>
          </>
        }
      >
        <Group footer="Calibrate again if the screen setting or browser has changed.">
          <Row>
            <span>Screen scale</span>
            <span className="ml-auto text-label-secondary">{stored.pxPerMm.toFixed(2)} px per mm</span>
          </Row>
        </Group>
      </ScreenFrame>
    );
  }

  // S-02: plus and minus change the outline by 0.1 mm at the current scale.
  const nudge = (mm: number) => setLengthPx((l) => Math.max(MIN_PX, l + mm * pxPerMmFromCardLength(l)));

  const pxPerMm = pxPerMmFromCardLength(lengthPx);
  const widthPx = lengthPx * (CARD_SHORT_MM / CARD_LONG_MM);

  const confirm = () => {
    const calibration = buildCalibration(protocol, lengthPx);
    const { min, max } = protocol.plausiblePxPerMm;
    if (calibration.pxPerMm < min || calibration.pxPerMm > max) {
      setProblem({
        title: "That isn't a bank card size",
        message: "Hold the card flat against the glass, push it against the left edge, and match the outline again.",
      });
      return;
    }
    if (!canDrawN6(protocol, calibration)) {
      // S-08: this screen cannot draw the smallest symbols sharply enough.
      setProblem({
        title: "This phone can't be used",
        message: "Its screen can't show the smallest symbols clearly. Use a different phone for screening.",
      });
      return;
    }
    saveCalibration(calibration);
    setCalibration(calibration);
    next();
  };

  return (
    <ScreenFrame
      {...frame}
      title="Calibrate"
      subtitle="Hold a bank card upright against the left edge of the screen. Drag the handle until the outline matches it."
      bleed={
        // Full width with no padding: the outline starts at the screen's very left edge, so the
        // card can be pushed against the edge of the glass and only two edges need matching.
        <div className="relative w-full bg-white" style={{ height: lengthPx + 64 }}>
          <div
            className="absolute top-2 left-0 box-border border-2 border-accent bg-accent-tint/40"
            style={{ width: widthPx, height: lengthPx, borderRadius: CARD_CORNER_MM * pxPerMm }}
          />
          <div
            role="slider"
            aria-label="Card outline size"
            aria-valuemin={MIN_PX}
            aria-valuenow={Math.round(lengthPx)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowRight") nudge(0.1);
              if (e.key === "ArrowUp" || e.key === "ArrowLeft") nudge(-0.1);
            }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              dragStart.current = { x: e.clientX, y: e.clientY, length: lengthPx };
            }}
            onPointerMove={(e) => {
              const start = dragStart.current;
              if (!start) return;
              // Use both directions: a sideways drag counts in proportion to the card's shape.
              const dy = e.clientY - start.y;
              const dx = (e.clientX - start.x) * (CARD_LONG_MM / CARD_SHORT_MM);
              setLengthPx(Math.max(MIN_PX, start.length + (dx + dy) / 2));
            }}
            onPointerUp={() => (dragStart.current = null)}
            onPointerCancel={() => (dragStart.current = null)}
            className="absolute size-11 touch-none rounded-full border-4 border-white bg-accent shadow-[0_2px_8px_rgb(0_0_0/0.25)]"
            // Sits just outside the bottom-right corner, so it never hides the edges being matched.
            style={{ left: widthPx + 2, top: 8 + lengthPx + 2 }}
          />
          {/* S-02: fine steps of 0.1 mm, in the free strip to the right of the card. */}
          <div className="absolute right-2 flex flex-col gap-3" style={{ top: 8 + lengthPx / 2 - 50 }}>
            <button
              type="button"
              aria-label="Make the outline 0.1 millimetre bigger"
              onClick={() => nudge(0.1)}
              className="flex size-11 items-center justify-center rounded-full bg-accent-tint text-title2 font-semibold text-accent active:bg-fill"
            >
              +
            </button>
            <button
              type="button"
              aria-label="Make the outline 0.1 millimetre smaller"
              onClick={() => nudge(-0.1)}
              className="flex size-11 items-center justify-center rounded-full bg-accent-tint text-title2 font-semibold text-accent active:bg-fill"
            >
              −
            </button>
          </div>
        </div>
      }
      actions={
        <>
          {problem && <TopModal title={problem.title} message={problem.message} onClose={() => setProblem(null)} />}
          <Button onClick={confirm}>The outline matches my card</Button>
        </>
      }
    />
  );
}
