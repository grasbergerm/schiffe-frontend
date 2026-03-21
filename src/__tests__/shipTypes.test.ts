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

describe("getShipTypeInfo — known ship types", () => {
  it("returns Cargo for shipType 70", () => {
    expect(getShipTypeInfo(70)).toMatchObject({ label: "Cargo", emoji: "🚢", category: "cargo" });
  });
  it("returns Tanker for shipType 80", () => {
    expect(getShipTypeInfo(80)).toMatchObject({ label: "Tanker", emoji: "🛢️", category: "tanker" });
  });
  it("returns Passenger for shipType 60", () => {
    expect(getShipTypeInfo(60)).toMatchObject({ label: "Passenger", emoji: "🛳️", category: "passenger" });
  });
  it("returns Other for shipType 30 (pleasure craft)", () => {
    expect(getShipTypeInfo(30)).toMatchObject({ label: "Other", emoji: "⛵", category: "other" });
  });
});
