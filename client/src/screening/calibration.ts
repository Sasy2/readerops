/**
 * Device calibration with a bank card (S-01 to S-09), stored on the device.
 */
import type { Protocol } from "./protocol";
import { belowRenderFloor } from "./ladder";
import type { Calibration } from "./types";

/**
 * ISO/IEC 7810 ID-1 bank card. S-03 divides by the 85.60 mm long side. The card is held
 * upright on the phone, so its long side runs down the screen: a phone is narrower than 85.6 mm.
 */
export const CARD_LONG_MM = 85.6;
export const CARD_SHORT_MM = 53.98;
/** ID-1 corner radius. */
export const CARD_CORNER_MM = 3.18;

const STORAGE_KEY = "readerops.calibration";

/** S-03: CSS pixels per mm = matched outline length (long side) in CSS px / 85.60. */
export function pxPerMmFromCardLength(cardLengthCssPx: number): number {
  return cardLengthCssPx / CARD_LONG_MM;
}

/** S-07: the smallest ladder level this device can draw at or above the render floor. */
export function smallestDrawableIndex(protocol: Protocol, pxPerMm: number, dpr: number): number {
  let index = 0;
  while (index + 1 < protocol.ladder.length && !belowRenderFloor(protocol, index + 1, pxPerMm, dpr)) {
    index += 1;
  }
  return index;
}

/** S-08: refuse to screen when the device cannot draw N6 at or above the render floor. */
export function canDrawN6(protocol: Protocol, calibration: Calibration): boolean {
  const n6 = protocol.ladder.findIndex((level) => level.n === "N6");
  return calibration.smallestDrawableIndex >= n6;
}

export function buildCalibration(protocol: Protocol, cardLengthCssPx: number): Calibration {
  const pxPerMm = pxPerMmFromCardLength(cardLengthCssPx);
  const dpr = window.devicePixelRatio;
  return {
    pxPerMm,
    dpr,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    userAgent: navigator.userAgent,
    calibratedAt: new Date().toISOString(),
    smallestDrawableIndex: smallestDrawableIndex(protocol, pxPerMm, dpr),
  };
}

export function saveCalibration(calibration: Calibration): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(calibration));
}

/**
 * Load the stored calibration, or null when there is none or it no longer matches this
 * device (S-05: screen size, devicePixelRatio or browser changed → recalibrate).
 */
export function loadCalibration(): Calibration | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const stored = JSON.parse(raw) as Calibration;
  const sameDevice =
    stored.dpr === window.devicePixelRatio &&
    stored.screenWidth === window.screen.width &&
    stored.screenHeight === window.screen.height &&
    stored.userAgent === navigator.userAgent;
  return sameDevice ? stored : null;
}
