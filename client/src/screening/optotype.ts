/**
 * Tumbling E geometry (S-53 to S-58, S-62).
 *
 * Sizes are physical: we convert millimetres to CSS pixels with the stored
 * calibration, never with a guess about the screen.
 */

export type Direction = "up" | "right" | "down" | "left";
export const DIRECTIONS: Direction[] = ["up", "right", "down", "left"];

/** One arcminute in radians. */
const ARCMIN = Math.PI / (180 * 60);

/**
 * S-53: symbol height (mm) = 2 × viewing distance (mm) × tan(angle / 2),
 * where angle = 5 arcminutes × 10^logMAR.
 */
export function symbolHeightMm(distanceMm: number, logMAR: number): number {
  const angle = 5 * ARCMIN * 10 ** logMAR;
  return 2 * distanceMm * Math.tan(angle / 2);
}

/**
 * ISO 8596: the white field must extend `marginDeg` beyond the symbol on every side.
 * Returns the field's full height (mm): symbol height plus a margin above and below.
 */
export function testFieldMm(distanceMm: number, logMAR: number, marginDeg: number): number {
  const margin = distanceMm * Math.tan((marginDeg * Math.PI) / 180);
  return symbolHeightMm(distanceMm, logMAR) + 2 * margin;
}

/** S-54: the E sits on a 5×5 grid, so stroke and gap are each one fifth of the height. */
export function strokeMm(heightMm: number): number {
  return heightMm / 5;
}

/** S-58: stroke width in device pixels = stroke mm × CSS px per mm × devicePixelRatio. */
export function strokeDevicePx(heightMm: number, pxPerMm: number, dpr: number): number {
  return strokeMm(heightMm) * pxPerMm * dpr;
}

/** S-62: orientation must come from a CSPRNG, never Math.random. */
export function randomDirection(): Direction {
  const [value] = crypto.getRandomValues(new Uint32Array(1));
  return DIRECTIONS[value % DIRECTIONS.length];
}

/** Rotation in degrees for an E whose arms point right at 0°. */
export const ROTATION: Record<Direction, number> = { right: 0, down: 90, left: 180, up: 270 };

/**
 * E with its arms pointing right, on a 5×5 grid (back bar + three arms, each one unit).
 */
export const E_PATH = "M0 0H5V1H1V2H5V3H1V4H5V5H0Z";

/**
 * S-56: crowding bar one grid unit thick, one grid unit away from the E.
 * Drawn as a square ring from -2 to 7 (outer) and -1 to 6 (inner), filled even-odd.
 */
export const CROWDING_PATH = "M-2 -2H7V7H-2Z M-1 -1V6H6V-1Z";

/** The full drawing spans 9 grid units (E + gap + bar on each side). */
export const DRAWING_UNITS = 9;
