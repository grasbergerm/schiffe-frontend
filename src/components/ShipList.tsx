import type { ShipData } from "../types";
import { ShipCard } from "./ShipCard";

interface Props {
  ships: ShipData[];
}

export function ShipList({ ships }: Props) {
  if (ships.length === 0) {
    return <p className="empty-state">No ships in range.</p>;
  }

  return (
    <div className="ship-list">
      {ships.map((ship, i) => (
        <ShipCard key={ship.mmsi} ship={ship} isNearest={i === 0} />
      ))}
    </div>
  );
}
