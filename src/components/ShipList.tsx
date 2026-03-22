import { useState, useRef } from "react";
import type { ShipData } from "../types";
import { ShipCard } from "./ShipCard";

interface Props {
  ships: ShipData[];
}

export function ShipList({ ships }: Props) {
  const [expandedMmsi, setExpandedMmsi] = useState<number | null>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  if (ships.length === 0) {
    return <p className="empty-state">No ships in range.</p>;
  }

  return (
    <div className="ship-list">
      {ships.map((ship, i) => {
        const isExpanded = ship.mmsi === expandedMmsi;
        const isNearest = expandedMmsi !== null ? isExpanded : i === 0;
        return (
          <ShipCard
            key={ship.mmsi}
            ref={(el) => {
              if (el) cardRefs.current.set(ship.mmsi, el);
              else cardRefs.current.delete(ship.mmsi);
            }}
            ship={ship}
            isNearest={isNearest}
            expanded={isExpanded}
            onToggle={() =>
              setExpandedMmsi((prev) => (prev === ship.mmsi ? null : ship.mmsi))
            }
          />
        );
      })}
    </div>
  );
}
