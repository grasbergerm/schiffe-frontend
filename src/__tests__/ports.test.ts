import { describe, it, expect } from "vitest";
import { resolveDestination } from "../utils/ports";

describe("resolveDestination", () => {
  it("returns null for null input", () => {
    expect(resolveDestination(null)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(resolveDestination("")).toBeNull();
  });

  it("returns null for whitespace-only string", () => {
    expect(resolveDestination("   ")).toBeNull();
  });

  it("resolves LOCODE 'DEHAM' to 'Hamburg'", () => {
    expect(resolveDestination("DEHAM")).toBe("Hamburg");
  });

  it("resolves LOCODE 'NLRTM' to 'Rotterdam'", () => {
    expect(resolveDestination("NLRTM")).toBe("Rotterdam");
  });

  it("resolves freetext 'HAMBURG' to 'Hamburg'", () => {
    expect(resolveDestination("HAMBURG")).toBe("Hamburg");
  });

  it("resolves freetext 'ROTTERDAM' to 'Rotterdam'", () => {
    expect(resolveDestination("ROTTERDAM")).toBe("Rotterdam");
  });

  it("returns the value as-is for unrecognised destination", () => {
    expect(resolveDestination("CUSTOM PORT")).toBe("CUSTOM PORT");
  });

  it("resolves lowercase LOCODE 'deham' to 'Hamburg' (case-insensitive)", () => {
    expect(resolveDestination("deham")).toBe("Hamburg");
  });
});
