import { useState, useEffect } from "react";
import type { ShipData } from "../types";
import { getShipTypeInfo } from "../utils/shipTypes";
import { formatDistance, formatSpeed, getDirection } from "../utils/format";
import { flagFromMmsi } from "../utils/flag";
import { navStatusShort } from "../utils/navStatus";
import { resolveDestination } from "../utils/ports";

interface Props {
  ship: ShipData;
  onClose: () => void;
}

export function WatchMode({ ship, onClose }: Props) {
  const typeInfo = getShipTypeInfo(ship.shipType);
  const flag = flagFromMmsi(ship.mmsi);
  const direction = getDirection(ship.heading);
  const statusBadge = navStatusShort(ship.navStatus);
  const destination = resolveDestination(ship.destination);

  const [photoStatus, setPhotoStatus] = useState<'loading' | 'found' | 'notfound'>('loading');

  useEffect(() => {
    setPhotoStatus('loading');
  }, [ship.mmsi]);

  const probeUrl = `https://photos.marinetraffic.com/ais/showphoto.aspx?mmsi=${ship.mmsi}`;

  return (
    <div className="watch-mode">
      <button className="watch-mode-close" onClick={onClose}>✕</button>
      {photoStatus === 'found' && (
        <a
          className="watch-mode-photo-link"
          href={probeUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="View ship photos on MarineTraffic"
        >📷</a>
      )}
      <img
        className="watch-mode-photo-probe"
        src={probeUrl}
        alt=""
        onLoad={() => setPhotoStatus('found')}
        onError={() => setPhotoStatus('notfound')}
      />
      <div className="watch-mode-inner">
        <div className="watch-mode-emoji">{typeInfo.emoji}</div>
        <div className="watch-mode-name">
          {flag && <span className="ship-flag">{flag}</span>}
          {ship.name || "Unknown"}
        </div>
        {statusBadge && <div className="watch-mode-status">{statusBadge}</div>}
        <div className="watch-mode-distance">{formatDistance(ship.distance)}</div>
        <div className="watch-mode-meta">
          {formatSpeed(ship.speed)} · {direction}
        </div>
        {destination && (
          <div className="watch-mode-destination">→ {destination}</div>
        )}
      </div>
    </div>
  );
}
