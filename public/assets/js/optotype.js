/**
 * ReaderOps — screen calibration and tumbling-E rendering.
 *
 * Geometry comes from ISO 8596: an optotype at logMAR 0 subtends 5 arcminutes
 * overall, and one stroke (and one gap) is 1/5 of that.
 *
 * Sanity check this file against these values before trusting it:
 *   logMAR 0.00 -> 0.582 mm tall, 0.116 mm stroke
 *   logMAR 0.27 -> 1.083 mm tall, 0.217 mm stroke   (N6, the fail threshold)
 */

const CARD_WIDTH_MM    = 85.60;  // ISO/IEC 7810 ID-1
const TEST_DISTANCE_MM = 400;    // WHO near-vision definition
const ARCMIN_RAD       = Math.PI / (180 * 60);

/* ---------- calibration ---------- */

export function pxPerMm(cardWidthCss) {
  return cardWidthCss / CARD_WIDTH_MM;
}

export function saveCalibration(cardWidthCss) {
  const cal = {
    pxPerMm:       pxPerMm(cardWidthCss),
    dpr:           window.devicePixelRatio,
    screenW:       window.screen.width,
    screenH:       window.screen.height,
    ua:            navigator.userAgent,
    calibratedAt:  new Date().toISOString()
  };
  localStorage.setItem('readerops.calibration', JSON.stringify(cal));
  return cal;
}

export function loadCalibration() {
  const raw = localStorage.getItem('readerops.calibration');
  return raw ? JSON.parse(raw) : null;
}

/* ---------- geometry ---------- */

export function optotypeHeightMm(logMAR) {
  const arcmin = 5 * Math.pow(10, logMAR);
  return 2 * TEST_DISTANCE_MM * Math.tan(arcmin * ARCMIN_RAD / 2);
}

export function strokeMm(logMAR) {
  return optotypeHeightMm(logMAR) / 5;
}

export function strokePx(logMAR, cal) {
  return strokeMm(logMAR) * cal.pxPerMm;
}

export function canRenderLevel(logMAR, cal, minStrokePx) {
  return strokePx(logMAR, cal) >= minStrokePx;
}

/* ---------- drawing ---------- */

// Standard tumbling E on a 5x5 unit grid: full-height spine, three equal arms.
const E_PATH = 'M0 0 H5 V1 H1 V2 H5 V3 H1 V4 H5 V5 H0 Z';

export const ORIENTATIONS = [0, 90, 180, 270];  // right, down, left, up

export function renderE(logMAR, cal, orientationDeg) {
  const u    = strokePx(logMAR, cal);   // one grid unit, CSS px
  const size = 5 * u;
  const gap  = u;                       // crowding gap
  const bar  = u;                       // crowding bar thickness
  const box  = size + 2 * gap + 2 * bar;

  // geometricPrecision stops the browser snapping edges to the pixel grid,
  // which is what keeps us inside the 5% ISO tolerance at small sizes.
  return `
    <svg width="${box}" height="${box}" viewBox="0 0 ${box} ${box}"
         shape-rendering="geometricPrecision" role="img"
         aria-label="Vision test symbol">
      <rect x="${bar / 2}" y="${bar / 2}"
            width="${box - bar}" height="${box - bar}"
            fill="none" stroke="#000" stroke-width="${bar}"/>
      <g transform="translate(${bar + gap}, ${bar + gap})">
        <g transform="rotate(${orientationDeg}, ${size / 2}, ${size / 2})">
          <path d="${E_PATH}" transform="scale(${u})" fill="#000"/>
        </g>
      </g>
    </svg>`;
}

export function randomOrientation() {
  // crypto, not Math.random: the sequence must not be predictable or replayable
  const b = crypto.getRandomValues(new Uint8Array(1))[0];
  return ORIENTATIONS[b % 4];
}
