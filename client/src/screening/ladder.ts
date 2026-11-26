/**
 * Near acuity ladder (S-59 to S-67) as a pure state machine, so it can be unit tested
 * without any UI.
 */
import type { Protocol } from "./protocol";
import { strokeDevicePx, symbolHeightMm } from "./optotype";

export type LadderState = {
  levelIndex: number;
  /** Which way we are moving: "down" to smaller symbols, "up" to larger ones. */
  direction: "down" | "up";
  smallestPassedIndex: number | null;
  done: boolean;
  /** Why the ladder stopped, once `done`. */
  stopReason?: "failed_after_pass" | "passed_while_moving_up" | "smallest_level" | "no_level_passed" | "incomplete_render";
};

export function startLadder(protocol: Protocol): LadderState {
  return { levelIndex: protocol.startLevelIndex, direction: "down", smallestPassedIndex: null, done: false };
}

/** S-67: would this level's stroke fall below the render floor on this device? */
export function belowRenderFloor(protocol: Protocol, levelIndex: number, pxPerMm: number, dpr: number): boolean {
  const height = symbolHeightMm(protocol.nearDistanceMm, protocol.ladder[levelIndex].logMAR);
  return strokeDevicePx(height, pxPerMm, dpr) < protocol.renderFloorPx;
}

/**
 * Apply the result of one level and decide what comes next.
 * `correct` is the number of correct answers on that level.
 */
export function nextLadderState(
  protocol: Protocol,
  state: LadderState,
  correct: number,
  device: { pxPerMm: number; dpr: number },
): LadderState {
  const passed = correct >= protocol.passMark; // S-63

  if (passed) {
    const smallestPassedIndex = state.levelIndex;
    // Moving up after a failed start: the first pass ends the ladder (S-65).
    if (state.direction === "up") {
      return { ...state, smallestPassedIndex, done: true, stopReason: "passed_while_moving_up" };
    }
    const next = state.levelIndex + 1; // S-64: next smaller level
    if (next >= protocol.ladder.length) {
      return { ...state, smallestPassedIndex, done: true, stopReason: "smallest_level" };
    }
    if (belowRenderFloor(protocol, next, device.pxPerMm, device.dpr)) {
      return { ...state, smallestPassedIndex, done: true, stopReason: "incomplete_render" };
    }
    return { ...state, smallestPassedIndex, levelIndex: next };
  }

  // S-66: stop at the first failed level that comes after a passed level.
  if (state.smallestPassedIndex !== null) {
    return { ...state, done: true, stopReason: "failed_after_pass" };
  }
  // S-65: the starting level failed, so move to larger symbols until one passes or N64 fails.
  if (state.levelIndex === 0) {
    return { ...state, done: true, stopReason: "no_level_passed" };
  }
  return { ...state, direction: "up", levelIndex: state.levelIndex - 1 };
}
