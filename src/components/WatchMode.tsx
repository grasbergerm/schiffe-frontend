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

  const [showPhoto, setShowPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    setShowPhoto(false);
    setPhotoError(false);
  }, [ship.mmsi]);

  const photoUrl = `https://photos.marinetraffic.com/ais/showphoto.aspx?mmsi=${ship.mmsi}`;

  return (
    <div className="watch-mode">
      <button className="watch-mode-close" onClick={onClose}>✕</button>
      <button
        className="watch-mode-photo-btn"
        onClick={() => setShowPhoto(p => !p)}
        title={showPhoto ? "Hide photo" : "Show photo"}
      >
        📷
      </button>
      <div className="watch-mode-inner">
        <div className="watch-mode-emoji">{typeInfo.emoji}</div>
        <div className="watch-mode-name">
          {flag && <span className="ship-flag">{flag}</span>}
          {ship.name || "Unknown"}
        </div>
        {statusBadge && <div className="watch-mode-status">{statusBadge}</div>}
        {showPhoto && (
          photoError
            ? <div className="watch-mode-no-photo">No photo available</div>
            : <img
                className="watch-mode-photo"
                src={photoUrl}
                alt={ship.name || "Ship photo"}
                onError={() => setPhotoError(true)}
              />
        )}
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
