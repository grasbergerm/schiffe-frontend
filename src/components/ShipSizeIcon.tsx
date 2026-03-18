import type { ShipCategory } from "../utils/shipTypes";

interface Props {
  length: number | null;
  width: number | null;
  category: ShipCategory;
}

const CATEGORY_COLOR: Record<ShipCategory, string> = {
  cargo: "var(--cargo)",
  tanker: "var(--tanker)",
  passenger: "var(--passenger)",
  other: "var(--other)",
};

const SCALE = 40 / 60;

export function ShipSizeIcon({ length, width, category }: Props) {
  if (!length || !width) return null;

  const iconW = Math.max(8, Math.round(length * SCALE));
  const iconH = Math.max(2, Math.round(width * SCALE));

  const color = CATEGORY_COLOR[category];

  return (
    <svg width={iconW} height={iconH}>
      <svg
        x={0}
        y={0}
        width={iconW}
        height={iconH}
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
      >
        <path
          d="M 1,0.5 C 0.85,0 0.5,0 0,0.1 L 0,0.9 C 0.5,1 0.85,1 1,0.5 Z"
          fill={color}
          opacity="0.7"
        />
      </svg>
    </svg>
  );
}
