import { describe, expect, it } from "vitest";
import { DIRECTIONS, randomDirection, strokeDevicePx, strokeMm, symbolHeightMm, testFieldMm } from "./optotype";

describe("symbol geometry (S-53, S-54, S-58)", () => {
  // Expected values from tests/README.md (the project's geometry check).
  it("draws logMAR 0 at 40 cm as 0.5818 mm tall with a 0.1164 mm stroke", () => {
    const height = symbolHeightMm(400, 0);
    expect(height).toBeCloseTo(0.5818, 4);
    expect(strokeMm(height)).toBeCloseTo(0.1164, 4);
  });

  it("draws N6 (logMAR 0.27) at 40 cm as 1.0833 mm tall with a 0.2167 mm stroke", () => {
    const height = symbolHeightMm(400, 0.27);
    expect(height).toBeCloseTo(1.0833, 3);
    expect(strokeMm(height)).toBeCloseTo(0.2167, 3);
  });

  it("draws the 6/9 distance symbol at 3 m about 6.6 mm tall (S-30)", () => {
    expect(symbolHeightMm(3000, 0.18)).toBeCloseTo(6.6, 1);
  });

  it("converts stroke to device pixels with px/mm and devicePixelRatio", () => {
    expect(strokeDevicePx(5, 6, 3)).toBeCloseTo(18); // 1 mm stroke × 6 px/mm × 3
  });
});

describe("orientation (S-62)", () => {
  it("only returns one of the four directions", () => {
    for (let i = 0; i < 200; i++) expect(DIRECTIONS).toContain(randomDirection());
  });
});

describe("test field (ISO 8596, 0.5° beyond the symbol)", () => {
  it("needs about 59 mm of white at 3 m for the 6/9 symbol", () => {
    expect(testFieldMm(3000, 0.18, 0.5)).toBeCloseTo(59, 0);
  });
});
