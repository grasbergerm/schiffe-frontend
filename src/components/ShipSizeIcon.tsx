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

  // Pixel side-profile cargo ship: hull + stacked containers + bridge + funnel
  // viewBox 32×14, bow pointing right, preserveAspectRatio="none"
  return (
    <svg width={iconW} height={iconH} viewBox="0 0 32 14" preserveAspectRatio="none">
      {/* hull — wide at deck (top), tapers toward keel (bottom) */}
      <polygon points="0,7  32,7  32,11  30,14  2,14  0,11" fill={color} opacity="0.9" />
      {/* bridge / superstructure — bow (right) side */}
      <rect x="20" y="3" width="10" height="4" fill={color} opacity="0.85" />
      {/* funnel / smokestack — above bridge */}
      <rect x="25" y="0" width="2" height="3" fill={color} opacity="0.9" />
      {/* container row bottom — 4 boxes with 1-unit gaps */}
      <rect x="2"  y="5" width="3" height="2" fill={color} opacity="0.8" />
      <rect x="6"  y="5" width="3" height="2" fill={color} opacity="0.8" />
      <rect x="10" y="5" width="3" height="2" fill={color} opacity="0.8" />
      <rect x="14" y="5" width="2" height="2" fill={color} opacity="0.8" />
      {/* container row top — 3 boxes, stacked above */}
      <rect x="2"  y="3" width="3" height="2" fill={color} opacity="0.65" />
      <rect x="6"  y="3" width="3" height="2" fill={color} opacity="0.65" />
      <rect x="10" y="3" width="3" height="2" fill={color} opacity="0.65" />
    </svg>
  );
}
