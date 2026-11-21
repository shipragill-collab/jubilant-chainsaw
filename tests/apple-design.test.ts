import { describe, expect, it } from "vitest";
import { project, rubberband } from "@/components/use-sheet";

describe("fluid sheet physics", () => {
  it("projects a flick forward like scroll momentum", () => {
    expect(project(0)).toBe(0);
    // 1000 px/s with the standard 0.998 rate lands about 499px further on.
    expect(project(1000)).toBeCloseTo(499, 0);
    expect(project(-500)).toBeLessThan(0);
  });
  it("rubber-bands: resistance grows the further you pull", () => {
    const h = 400;
    const a = rubberband(-50, h);
    const b = rubberband(-200, h);
    expect(Math.abs(a)).toBeLessThan(50);
    expect(Math.abs(b)).toBeLessThan(200);
    expect(Math.abs(b) / 200).toBeLessThan(Math.abs(a) / 50);
  });
});
