"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { answerVibration } from "../device";
import { randomDirection, strokeDevicePx, symbolHeightMm, testFieldMm, type Direction } from "../optotype";
import type { Protocol } from "../protocol";
import { swipeDirection } from "../swipe";
import type { Calibration, SymbolRecord } from "../types";
import { AnswerPad } from "./AnswerPad";
import { Optotype } from "./Optotype";

/** S-51: blank white screen between symbols. */
const BLANK_MS = 250;

export type RunResult = Omit<SymbolRecord, "sequence">[];

/**
 * Shows `count` symbols of one size, one at a time, and returns the raw answers.
 * It never shows whether an answer was correct (S-49).
 */
export function SymbolRun({
  protocol,
  calibration,
  count,
  levelIndex,
  logMAR,
  distanceMm,
  meta,
  unseenLabel,
  showHint = false,
  onDone,
}: {
  protocol: Protocol;
  calibration: Calibration;
  count: number;
  levelIndex: number;
  logMAR: number;
  distanceMm: number;
  /** Extra fields stored on every record of this run. */
  meta: Pick<SymbolRecord, "phase" | "n"> & Partial<Pick<SymbolRecord, "eye" | "pinhole" | "lensPower">>;
  unseenLabel: string;
  /** Practice only: highlight the right arrow (S-42). */
  showHint?: boolean;
  onDone: (records: RunResult) => void;
}) {
  const heightMm = symbolHeightMm(distanceMm, logMAR);
  const stroke = strokeDevicePx(heightMm, calibration.pxPerMm, calibration.dpr);
  const fieldPx = testFieldMm(distanceMm, logMAR, protocol.testFieldMarginDeg) * calibration.pxPerMm;

  const [records, setRecords] = useState<RunResult>([]);
  const [direction, setDirection] = useState<Direction>(randomDirection);
  const [blank, setBlank] = useState(false);
  const shownAt = useRef(0);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const answer = useCallback(
    (answered: Direction | null) => {
      if (blank) return;
      answerVibration();
      const record = {
        ...meta,
        levelIndex,
        logMAR,
        shown: direction,
        answered,
        responseMs: Math.round(performance.now() - shownAt.current),
        strokeDevicePx: stroke,
        timestamp: new Date().toISOString(),
      };
      const next = [...records, record];
      setRecords(next);
      setBlank(true);
      setTimeout(() => {
        if (next.length >= count) {
          onDone(next);
          return;
        }
        setDirection(randomDirection());
        setBlank(false);
      }, BLANK_MS);
    },
    [blank, count, direction, levelIndex, logMAR, meta, onDone, records, stroke],
  );

  // Start the response clock when a symbol appears. There is no timeout: a symbol stays
  // until the customer swipes or taps "I can't see it" (Q-47 decided: no unseen timeout, so
  // S-52 and A-81 are dropped).
  useEffect(() => {
    if (!blank) shownAt.current = performance.now();
  }, [blank, direction]);

  // Keyboard arrows also answer, so the check works on a laptop and with assistive keyboards.
  useEffect(() => {
    const KEYS: Record<string, Direction> = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
    const onKey = (e: KeyboardEvent) => {
      const direction = KEYS[e.key];
      if (!direction) return;
      e.preventDefault();
      answer(direction);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer]);

  // S-16: if the app loses focus mid-level, restart this level from its first symbol.
  useEffect(() => {
    const restart = () => {
      if (document.visibilityState !== "hidden") return;
      setRecords([]);
      setDirection(randomDirection());
      setBlank(false);
    };
    document.addEventListener("visibilitychange", restart);
    return () => document.removeEventListener("visibilitychange", restart);
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-5">
      {/* S-50: progress in symbols only, never the level name or size. */}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-fill"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={count}
        aria-valuenow={records.length}
        aria-label="Symbols done"
      >
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${(records.length / count) * 100}%` }} />
      </div>

      {/* S-14: plain white test area with nothing else inside it, at least as tall as the
          ISO 8596 field (about 59 mm at 3 m, 8 mm at 40 cm).
          S-46: the customer answers by swiping here the way the E points (no arrow buttons). */}
      <div
        style={{ minHeight: fieldPx }}
        aria-label="Swipe the way the E points"
        className="flex flex-1 touch-none items-center justify-center bg-white select-none"
        onPointerDown={(e) => (swipeStart.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          if (!swipeStart.current) return;
          const swiped = swipeDirection(e.clientX - swipeStart.current.x, e.clientY - swipeStart.current.y);
          swipeStart.current = null;
          if (swiped) answer(swiped);
        }}
        onPointerCancel={() => (swipeStart.current = null)}
      >
        {!blank && <Optotype heightMm={heightMm} pxPerMm={calibration.pxPerMm} direction={direction} />}
      </div>

      <AnswerPad
        onAnswer={answer}
        unseenLabel={unseenLabel}
        disabled={blank}
        hint={showHint && records.length === 0 ? direction : undefined}
      />
    </div>
  );
}
