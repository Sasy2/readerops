import { CROWDING_PATH, DRAWING_UNITS, E_PATH, ROTATION, type Direction } from "../optotype";

/**
 * A tumbling E with its crowding bar, drawn at an exact physical size.
 *
 * S-55: fractional CSS pixel sizes and geometricPrecision, never rounded.
 * S-57: no CSS scaling or zoom; size comes only from width/height in CSS px.
 */
export function Optotype({
  heightMm,
  pxPerMm,
  direction,
}: {
  heightMm: number;
  pxPerMm: number;
  direction: Direction;
}) {
  // The E is 5 grid units tall; the whole drawing (with the crowding bar) is 9.
  const sizePx = (heightMm * pxPerMm * DRAWING_UNITS) / 5;
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox={`-2 -2 ${DRAWING_UNITS} ${DRAWING_UNITS}`}
      shapeRendering="geometricPrecision"
      role="img"
      aria-label="Test symbol"
    >
      <path d={CROWDING_PATH} fillRule="evenodd" fill="#000" />
      <path d={E_PATH} fill="#000" transform={`rotate(${ROTATION[direction]} 2.5 2.5)`} />
    </svg>
  );
}
