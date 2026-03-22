import { forwardRef, memo, useState, useEffect } from "react";
import type { ShipData } from "../types";
import { getShipTypeInfo } from "../utils/shipTypes";
import { formatDistance, formatSpeed, formatRelativeTime, getDirection } from "../utils/format";
import { flagFromMmsi, countryFromMmsi } from "../utils/flag";
import { navStatusLabel, navStatusShort } from "../utils/navStatus";
import { resolveDestination } from "../utils/ports";
import { ShipSizeIcon } from "./ShipSizeIcon";

interface Props {
  ship: ShipData;
  isNearest: boolean;
  expanded: boolean;
  onToggle: () => void;
}

export const ShipCard = memo(forwardRef<HTMLDivElement, Props>(function ShipCard({ ship, isNearest, expanded, onToggle }: Props, ref) {
  const typeInfo = getShipTypeInfo(ship.shipType);
  const direction = getDirection(ship.heading);

  const [photoStatus, setPhotoStatus] = useState<'loading' | 'found' | 'notfound'>('loading');
  const probeUrl = `https://photos.marinetraffic.com/ais/showphoto.aspx?mmsi=${ship.mmsi}`;

  useEffect(() => {
    if (!expanded) setPhotoStatus('loading');
  }, [expanded]);
  const flag = flagFromMmsi(ship.mmsi);
  const country = countryFromMmsi(ship.mmsi);
  const status = navStatusLabel(ship.navStatus);
  const statusBadge = navStatusShort(ship.navStatus);
  const destination = resolveDestination(ship.destination);

  return (
    <div
      ref={ref}
      className={`ship-card${isNearest ? " ship-card-nearest" : ""}${expanded ? " ship-card-expanded" : ""}`}
      onClick={onToggle}
    >
      <div className="ship-card-row">
        <span className={`type-pill type-pill-${typeInfo.category}`}>
          {typeInfo.emoji}
        </span>
        <span className="ship-name">
          {flag && <span className="ship-flag">{flag}</span>}
          {ship.name || "Unknown"}
          {statusBadge && <span className="ship-status-badge">{statusBadge}</span>}
        </span>
        <span className="ship-direction">{direction}</span>
        <span className="ship-speed">{formatSpeed(ship.speed)}</span>
        <span className="ship-distance mono">{formatDistance(ship.distance)}</span>
      </div>
      <div className="ship-icon-row">
        <ShipSizeIcon length={ship.length} width={ship.width} category={typeInfo.category} />
      </div>
      <div className="ship-card-footer">
        <span className="ship-lastseen">{formatRelativeTime(ship.lastUpdate)}</span>
        {destination && <span className="ship-destination">→ {destination}</span>}
      </div>

      {expanded && (
        <div className="ship-card-details">
          <img
            className="ship-photo-probe"
            src={probeUrl}
            alt=""
            aria-hidden="true"
            onLoad={() => setPhotoStatus('found')}
            onError={() => setPhotoStatus('notfound')}
          />
          <div className="detail-row">
            <span className="detail-label">Type</span>
            <span className="detail-value">{typeInfo.label}</span>
          </div>
          {flag && country && (
            <div className="detail-row">
              <span className="detail-label">Flag</span>
              <span className="detail-value">{flag} {country}</span>
            </div>
          )}
          {status && (
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value">{status}</span>
            </div>
          )}
          {destination && (
            <div className="detail-row">
              <span className="detail-label">Destination</span>
              <span className="detail-value">{destination}</span>
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
          {photoStatus !== 'loading' && (
            <div className="detail-row">
              <span className="detail-label">Photos</span>
              {photoStatus === 'found' ? (
                <a
                  className="ship-photo-link"
                  href={probeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View ship photos on MarineTraffic"
                  onClick={(e) => e.stopPropagation()}
                >📷</a>
              ) : (
                <span className="detail-value">Not available</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}), (prev, next) =>
  prev.isNearest        === next.isNearest        &&
  prev.expanded         === next.expanded          &&
  prev.ship.name        === next.ship.name         &&
  prev.ship.shipType    === next.ship.shipType      &&
  prev.ship.heading     === next.ship.heading       &&
  prev.ship.speed       === next.ship.speed         &&
  prev.ship.distance    === next.ship.distance      &&
  prev.ship.navStatus   === next.ship.navStatus     &&
  prev.ship.destination === next.ship.destination   &&
  prev.ship.lastUpdate  === next.ship.lastUpdate    &&
  prev.ship.length      === next.ship.length        &&
  prev.ship.width       === next.ship.width
)
