import type { CellType } from "../types";

export function rotateGrid(
  grid: CellType[][],
  angleDeg: number,
  size: number,
): (CellType | null)[][] {
  const srcSize = grid.length;

  if (angleDeg === 0 && srcSize === size) return grid;

  const theta = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const outCx = (size - 1) / 2;
  const srcCx = (srcSize - 1) / 2;

  return Array.from({ length: size }, (_, outR) =>
    Array.from({ length: size }, (_, outC) => {
      const dx = outC - outCx;
      const dy = outR - outCx;
      const srcC = Math.round(srcCx + dx * cos + dy * sin);
      const srcR = Math.round(srcCx - dx * sin + dy * cos);
      if (srcR < 0 || srcR >= srcSize || srcC < 0 || srcC >= srcSize) return null;
      return grid[srcR][srcC];
    }),
  );
}
