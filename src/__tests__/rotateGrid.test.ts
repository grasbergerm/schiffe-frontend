import { describe, it, expect } from "vitest";
import { rotateGrid } from "../utils/rotateGrid";
import type { CellType } from "../types";

function makeGrid(size: number, fill: CellType): CellType[][] {
  return Array.from({ length: size }, () => Array(size).fill(fill));
}

describe("rotateGrid", () => {
  it("returns identical grid at 0°", () => {
    const grid: CellType[][] = [
      ["water", "land"],
      ["land", "water"],
    ];
    expect(rotateGrid(grid, 0, 2)).toEqual(grid);
  });

  it("rotates 90° clockwise correctly", () => {
    // Label cells by position for easy verification:
    // [TL, TR]    after 90° CW:  [BL, TL]
    // [BL, BR]                   [BR, TR]
    const grid: CellType[][] = [
      ["water", "land"],
      ["land", "water"],
    ];
    const rotated = rotateGrid(grid, 90, 2);
    expect(rotated[0][0]).toBe("land");   // BL
    expect(rotated[0][1]).toBe("water");  // TL
    expect(rotated[1][0]).toBe("water");  // BR
    expect(rotated[1][1]).toBe("land");   // TR
  });

  it("rotates 180° correctly", () => {
    const grid: CellType[][] = [
      ["water", "land"],
      ["land", "water"],
    ];
    const rotated = rotateGrid(grid, 180, 2);
    // 180° reverses both axes
    expect(rotated[0][0]).toBe("water");
    expect(rotated[0][1]).toBe("land");
    expect(rotated[1][0]).toBe("land");
    expect(rotated[1][1]).toBe("water");
  });

  it("returns null for out-of-bounds cells when source equals output size", () => {
    const grid: CellType[][] = [
      ["water", "water", "water", "water"],
      ["water", "land", "land", "water"],
      ["water", "land", "land", "water"],
      ["water", "water", "water", "water"],
    ];
    const rotated = rotateGrid(grid, 45, 4);
    expect(rotated[0][0]).toBeNull();
    expect(rotated[0][3]).toBeNull();
    expect(rotated[3][0]).toBeNull();
    expect(rotated[3][3]).toBeNull();
  });

  it("has no null cells when source grid is padded", () => {
    const src = makeGrid(6, "water");
    const rotated = rotateGrid(src, 45, 4);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        expect(rotated[r][c]).not.toBeNull();
      }
    }
  });

  it("crops to center when source is larger at 0°", () => {
    const src = makeGrid(6, "water");
    src[1][1] = "land";
    const rotated = rotateGrid(src, 0, 4);
    expect(rotated[0][0]).toBe("land");
    expect(rotated[3][3]).toBe("water");
  });

  it("360° returns identical grid", () => {
    const grid = makeGrid(4, "water");
    grid[0][0] = "land";
    const rotated = rotateGrid(grid, 360, 4);
    expect(rotated).toEqual(grid);
  });
});
