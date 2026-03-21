import { describe, it, expect } from "vitest";
import { getShipTypeInfo } from "../utils/shipTypes";

describe("getShipTypeInfo — null (unknown) ship type", () => {
  it("returns ❓ emoji for null shipType", () => {
    expect(getShipTypeInfo(null).emoji).toBe("❓");
  });
  it("returns label 'Unknown' for null shipType", () => {
    expect(getShipTypeInfo(null).label).toBe("Unknown");
  });
  it("returns category 'other' for null shipType", () => {
    expect(getShipTypeInfo(null).category).toBe("other");
  });
});
