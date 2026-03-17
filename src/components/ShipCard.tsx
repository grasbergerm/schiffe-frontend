import { useState } from "react";
import type { ShipData } from "../types";
import { getShipTypeInfo } from "../utils/shipTypes";
import { formatDistance, formatSpeed, getDirection } from "../utils/format";
import { flagFromMmsi } from "../utils/flag";
import { navStatusLabel } from "../utils/navStatus";
import { resolveDestination } from "../utils/ports";

interface Props {
  ship: ShipData;
  isNearest: boolean;
}

export function ShipCard({ ship, isNearest }: Props) {
  const [expanded, setExpanded] = useState(false);
  const typeInfo = getShipTypeInfo(ship.shipType);
  const direction = getDirection(ship.heading, ship.lon);
  const flag = flagFromMmsi(ship.mmsi);
  const status = navStatusLabel(ship.navStatus);

  return (
    <div
      className={`ship-card${isNearest ? " ship-card-nearest" : ""}${expanded ? " ship-card-expanded" : ""}`}
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="ship-card-row">
        <span className={`type-pill type-pill-${typeInfo.category}`}>
          {typeInfo.emoji}
        </span>
        <span className="ship-name">
          {flag && <span className="ship-flag">{flag}</span>}
          {ship.name || "Unknown"}
        </span>
        <span className="ship-direction">{direction}</span>
        <span className="ship-speed">{formatSpeed(ship.speed)}</span>
        <span className="ship-distance mono">{formatDistance(ship.distance)}</span>
      </div>

      {expanded && (
        <div className="ship-card-details">
          {status && (
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value">{status}</span>
            </div>
          )}
          {resolveDestination(ship.destination) && (
            <div className="detail-row">
              <span className="detail-label">Destination</span>
              <span className="detail-value">{resolveDestination(ship.destination)}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Speed</span>
            <span className="detail-value">
              {formatSpeed(ship.speed)}
              {ship.heading !== 511 && ` · ${ship.heading}°`}
            </span>
          </div>
          {ship.length && ship.width && (
            <div className="detail-row">
              <span className="detail-label">Size</span>
              <span className="detail-value">{ship.length} × {ship.width} m</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">MMSI</span>
            <span className="detail-value mono">{ship.mmsi}</span>
          </div>

        </div>
      )}
    </div>
  );
}
