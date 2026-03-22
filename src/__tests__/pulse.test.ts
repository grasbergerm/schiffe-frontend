import { describe, it, expect } from "vitest";
import { shipPulseAlpha } from "../utils/pulse";

describe("shipPulseAlpha", () => {
  it("returns 1.0 for stationary ships (speed 0)", () => {
    expect(shipPulseAlpha(0, 0)).toBe(1.0);
    expect(shipPulseAlpha(0, 5)).toBe(1.0);
    expect(shipPulseAlpha(0, 100)).toBe(1.0);
  });

  it("oscillates between 0.3 and 1.0 for moving ships", () => {
    const speed = 10; // 1 Hz
    const samples = Array.from({ length: 100 }, (_, i) =>
      shipPulseAlpha(speed, i * 0.01)
    );
    expect(Math.min(...samples)).toBeGreaterThanOrEqual(0.3 - 1e-9);
    expect(Math.max(...samples)).toBeLessThanOrEqual(1.0 + 1e-9);
  });

  it("reaches min and max opacity within one cycle", () => {
    const speed = 10; // 1 Hz, period = 1s
    // At t=0.25 (sin peaks at 1): max alpha
    expect(shipPulseAlpha(speed, 0.25)).toBeCloseTo(1.0, 5);
    // At t=0.75 (sin troughs at -1): min alpha
    expect(shipPulseAlpha(speed, 0.75)).toBeCloseTo(0.3, 5);
  });

  it("caps frequency at 2 Hz for very fast ships", () => {
    // speed=20 → freq=2, speed=30 → freq should also be 2 (capped)
    // At same time offset, both should produce the same alpha
    expect(shipPulseAlpha(20, 0.5)).toBeCloseTo(shipPulseAlpha(30, 0.5), 5);
    expect(shipPulseAlpha(20, 0.125)).toBeCloseTo(shipPulseAlpha(50, 0.125), 5);
  });

  it("pulses faster at higher speeds", () => {
    // speed=5 (0.5 Hz, period=2s): at t=1.0, sin(2*PI*0.5*1)=sin(PI)=0 → mid
    expect(shipPulseAlpha(5, 1.0)).toBeCloseTo(0.65, 5);
    // speed=10 (1 Hz, period=1s): at t=0.5, sin(2*PI*1*0.5)=sin(PI)=0 → mid
    expect(shipPulseAlpha(10, 0.5)).toBeCloseTo(0.65, 5);
    // At t=0.25: speed=10 peaks (1 Hz quarter-cycle), speed=5 is only at quarter of half-cycle
    expect(shipPulseAlpha(10, 0.25)).toBeGreaterThan(shipPulseAlpha(5, 0.25));
  });
});
