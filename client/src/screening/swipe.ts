import type { Direction } from "./optotype";

/** A swipe shorter than this (CSS px) is treated as a tap and ignored. */
const MIN_SWIPE_PX = 40;

/**
 * S-46: turn a finger movement into the direction the customer swiped.
 * The longer axis wins, so a slightly diagonal swipe still counts.
 */
export function swipeDirection(dx: number, dy: number): Direction | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < MIN_SWIPE_PX) return null;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}
