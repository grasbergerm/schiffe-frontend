export type ShipCategory = "cargo" | "tanker" | "passenger" | "other";

export interface ShipTypeInfo {
  label: string;
  emoji: string;
  category: ShipCategory;
}

export function getShipTypeInfo(shipType: number | null): ShipTypeInfo {
  if (shipType === null) return { label: "Unknown", emoji: "❓", category: "other" };

  const firstDigit = Math.floor(shipType / 10);

  switch (firstDigit) {
    case 6:
      return { label: "Passenger", emoji: "🛳️", category: "passenger" };
    case 7:
      return { label: "Cargo", emoji: "🚢", category: "cargo" };
    case 8:
      return { label: "Tanker", emoji: "🛢️", category: "tanker" };
    default:
      return { label: "Other", emoji: "⛵", category: "other" };
  }
}

export const FILTER_OPTIONS: { label: string; value: string; emoji?: string }[] = [
  { label: "All", value: "all" },
  { label: "Cargo", value: "cargo", emoji: "🚢" },
  { label: "Tanker", value: "tanker", emoji: "🛢️" },
  { label: "Passenger", value: "passenger", emoji: "🛳️" },
  { label: "Other", value: "other", emoji: "⛵" },
];
