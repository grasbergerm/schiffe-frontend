import { describe, it, expect } from "vitest";
import { navStatusLabel, navStatusShort } from "../utils/navStatus";

describe("navStatusLabel", () => {
  it("returns null for null input", () => {
    expect(navStatusLabel(null)).toBeNull();
  });

  it("returns 'Underway' for status 0", () => {
    expect(navStatusLabel(0)).toBe("Underway");
  });

  it("returns 'At anchor' for status 1", () => {
    expect(navStatusLabel(1)).toBe("At anchor");
  });

  it("returns 'Not under command' for status 2", () => {
    expect(navStatusLabel(2)).toBe("Not under command");
  });

  it("returns 'Restricted manoeuvrability' for status 3", () => {
    expect(navStatusLabel(3)).toBe("Restricted manoeuvrability");
  });

  it("returns 'Constrained by draught' for status 4", () => {
    expect(navStatusLabel(4)).toBe("Constrained by draught");
  });

  it("returns 'Moored' for status 5", () => {
    expect(navStatusLabel(5)).toBe("Moored");
  });

  it("returns 'Aground' for status 6", () => {
    expect(navStatusLabel(6)).toBe("Aground");
  });

  it("returns 'Engaged in fishing' for status 7", () => {
    expect(navStatusLabel(7)).toBe("Engaged in fishing");
  });

  it("returns 'Underway sailing' for status 8", () => {
    expect(navStatusLabel(8)).toBe("Underway sailing");
  });

  it("returns 'Unknown' for status 15", () => {
    expect(navStatusLabel(15)).toBe("Unknown");
  });

  it("returns null for unknown status 99", () => {
    expect(navStatusLabel(99)).toBeNull();
  });
});

describe("navStatusShort", () => {
  it("returns null for null input", () => {
    expect(navStatusShort(null)).toBeNull();
  });

  it("returns 'At anchor' for status 1", () => {
    expect(navStatusShort(1)).toBe("At anchor");
  });

  it("returns 'NUC' for status 2", () => {
    expect(navStatusShort(2)).toBe("NUC");
  });

  it("returns 'Restricted' for status 3", () => {
    expect(navStatusShort(3)).toBe("Restricted");
  });

  it("returns 'Draught' for status 4", () => {
    expect(navStatusShort(4)).toBe("Draught");
  });

  it("returns 'Aground' for status 6", () => {
    expect(navStatusShort(6)).toBe("Aground");
  });

  it("returns 'Fishing' for status 7", () => {
    expect(navStatusShort(7)).toBe("Fishing");
  });

  it("returns null for unknown status 99", () => {
    expect(navStatusShort(99)).toBeNull();
  });
});
