import { describe, expect, it } from "vitest";
import { swipeDirection } from "./swipe";

describe("swipe answers (S-46)", () => {
  it("reads the four directions from the longer axis", () => {
    expect(swipeDirection(80, 10)).toBe("right");
    expect(swipeDirection(-80, 20)).toBe("left");
    expect(swipeDirection(15, -90)).toBe("up");
    expect(swipeDirection(-10, 70)).toBe("down");
  });

  it("ignores short movements, so a tap is not an answer", () => {
    expect(swipeDirection(20, 10)).toBeNull();
  });
});
