import { describe, it, expect } from "vitest";
import {
  formatDistance,
  formatSpeed,
  formatTime,
  formatNow,
  formatRelativeTime,
  getDirection,
} from "../utils/format";

describe("formatDistance", () => {
  it("formats km with one decimal", () => {
    expect(formatDistance(3.567)).toBe("3.6 km");
  });
});

describe("formatSpeed", () => {
  it("formats knots with one decimal", () => {
    expect(formatSpeed(12.3)).toBe("12.3 kn");
  });
});

describe("formatTime", () => {
  it("returns a string containing ':' for a valid ISO string", () => {
    const result = formatTime(new Date().toISOString());
    expect(result).toContain(":");
  });
});

describe("formatNow", () => {
  it("returns a string containing ':'", () => {
    const result = formatNow();
    expect(result).toContain(":");
  });
});

describe("formatRelativeTime", () => {
  it("returns 'just now' for a timestamp less than 1 minute ago", () => {
    const iso = new Date().toISOString();
    expect(formatRelativeTime(iso)).toBe("just now");
  });

  it("returns 'N min ago' for a timestamp 10 minutes ago", () => {
    const iso = new Date(Date.now() - 10 * 60_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("10 min ago");
  });

  it("returns 'Nh ago' for a timestamp 120 minutes ago", () => {
    const iso = new Date(Date.now() - 120 * 60_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("2h ago");
  });
});

describe("formatRelativeTime — boundary values", () => {
  it("returns 'just now' for exactly 0 minutes ago", () => {
    const iso = new Date(Date.now()).toISOString();
    expect(formatRelativeTime(iso)).toBe("just now");
  });

  it("returns '1 min ago' for exactly 1 minute ago (diffMin < 1 kills <= mutation)", () => {
    // diffMin = 1 → original: 1 < 1 is false → "1 min ago"; mutation <= 1: true → "just now"
    const iso = new Date(Date.now() - 60_001).toISOString();
    expect(formatRelativeTime(iso)).toBe("1 min ago");
  });

  it("returns '1h ago' for exactly 60 minutes ago (diffMin < 60 kills <= mutation)", () => {
    // diffMin = 60 → original: 60 < 60 is false → "1h ago"; mutation <= 60: true → "60 min ago"
    const iso = new Date(Date.now() - 60 * 60_001).toISOString();
    expect(formatRelativeTime(iso)).toBe("1h ago");
  });
});

describe("getDirection", () => {
  it("returns '—' for heading 511", () => {
    expect(getDirection(511)).toBe("—");
  });

  it("returns 'N' for heading 0", () => {
    expect(getDirection(0)).toBe("N");
  });

  it("returns 'NE' for heading 45", () => {
    expect(getDirection(45)).toBe("NE");
  });

  it("returns 'E' for heading 90", () => {
    expect(getDirection(90)).toBe("E");
  });

  it("returns 'SE' for heading 135", () => {
    expect(getDirection(135)).toBe("SE");
  });

  it("returns 'S' for heading 180", () => {
    expect(getDirection(180)).toBe("S");
  });

  it("returns 'SW' for heading 225", () => {
    expect(getDirection(225)).toBe("SW");
  });

  it("returns 'W' for heading 270", () => {
    expect(getDirection(270)).toBe("W");
  });

  it("returns 'NW' for heading 315", () => {
    expect(getDirection(315)).toBe("NW");
  });

  it("returns 'N' for heading 1 (kills heading*45 arithmetic mutation)", () => {
    // heading/45: Math.round(1/45)=0 → "N". heading*45: Math.round(1*45)%8=5 → "SW"
    expect(getDirection(1)).toBe("N");
  });
});
