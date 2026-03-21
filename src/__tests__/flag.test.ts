import { describe, it, expect } from "vitest";
import { flagFromMmsi, countryFromMmsi } from "../utils/flag";

describe("flagFromMmsi", () => {
  it("returns German flag emoji for MMSI 211000001", () => {
    // MID 211 → DE → 🇩🇪
    expect(flagFromMmsi(211000001)).toBe("🇩🇪");
  });

  it("returns UK flag emoji for MMSI 232000001", () => {
    // MID 232 → GB → 🇬🇧
    expect(flagFromMmsi(232000001)).toBe("🇬🇧");
  });

  it("returns null for unknown MID (MMSI 100000001)", () => {
    // MID 100 is not in the map
    expect(flagFromMmsi(100000001)).toBeNull();
  });

  it("DE flag is composed of two regional indicator symbols", () => {
    const flag = flagFromMmsi(211000001)!;
    // The flag emoji consists of 2 regional indicator symbols (each 2 code units wide in JS)
    // So the string has length 4 but codePointAt gives the correct emoji codepoints
    const firstCodePoint = flag.codePointAt(0);
    // 'D' = charCode 68, 0x1f1e6 + 68 - 65 = 0x1f1e9
    expect(firstCodePoint).toBe(0x1f1e9);
  });
});

describe("countryFromMmsi", () => {
  it("returns 'Germany' for MMSI 211000001", () => {
    expect(countryFromMmsi(211000001)).toBe("Germany");
  });

  it("returns 'Cyprus' for MMSI 209000001", () => {
    expect(countryFromMmsi(209000001)).toBe("Cyprus");
  });

  it("returns null for unknown MID", () => {
    expect(countryFromMmsi(100000001)).toBeNull();
  });
});
