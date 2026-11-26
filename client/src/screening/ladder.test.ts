import { describe, expect, it } from "vitest";
import { nextLadderState, startLadder } from "./ladder";
import { DEFAULT_PROTOCOL as protocol } from "./protocol";

// A sharp screen, so the render floor never stops the ladder unless a test wants it to.
const sharp = { pxPerMm: 20, dpr: 3 };
const PASS = 3;
const FAIL = 2;

/** Run the ladder with a list of results (correct answers per level). */
function run(results: number[], device = sharp) {
  let state = startLadder(protocol);
  const visited: number[] = [];
  for (const correct of results) {
    visited.push(state.levelIndex);
    state = nextLadderState(protocol, state, correct, device);
    if (state.done) break;
  }
  return { state, visited };
}

describe("near ladder (S-59 to S-67)", () => {
  it("starts at the protocol's starting level, N25.6 (S-60)", () => {
    expect(protocol.ladder[startLadder(protocol).levelIndex].n).toBe("N25.6");
  });

  it("moves to smaller levels after each pass and stops at the first fail after a pass (S-64, S-66)", () => {
    const { state, visited } = run([PASS, PASS, FAIL]);
    expect(visited).toEqual([4, 5, 6]);
    expect(state.smallestPassedIndex).toBe(5);
    expect(state.stopReason).toBe("failed_after_pass");
  });

  it("moves to larger levels when the start fails, and stops at the first pass (S-65)", () => {
    const { state, visited } = run([FAIL, FAIL, PASS]);
    expect(visited).toEqual([4, 3, 2]);
    expect(state.smallestPassedIndex).toBe(2);
    expect(state.stopReason).toBe("passed_while_moving_up");
  });

  it("stops with no level passed when N64 fails", () => {
    const { state } = run([FAIL, FAIL, FAIL, FAIL, FAIL]);
    expect(state.smallestPassedIndex).toBeNull();
    expect(state.stopReason).toBe("no_level_passed");
  });

  it("stops after passing the smallest level", () => {
    const { state } = run(Array(12).fill(PASS));
    expect(state.smallestPassedIndex).toBe(protocol.ladder.length - 1);
    expect(state.stopReason).toBe("smallest_level");
  });

  it("stops as incomplete_render when the next level is below the render floor (S-67)", () => {
    // 4 px/mm at dpr 1: N20 has a ~0.72 mm stroke (2.9 px), just under the 3 px floor,
    // so the ladder stops after passing N25.6.
    const { state } = run(Array(12).fill(PASS), { pxPerMm: 4, dpr: 1 });
    expect(state.stopReason).toBe("incomplete_render");
    expect(protocol.ladder[state.smallestPassedIndex!].n).toBe("N25.6");
  });
});
