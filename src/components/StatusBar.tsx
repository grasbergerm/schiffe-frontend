import type { ApiMeta } from "../types";
import { formatNow } from "../utils/format";

interface Props {
  meta: ApiMeta | null;
  error: string | null;
  shipCount: number;
  locationName: string;
  isDefaultLocation: boolean;
  onRequestLocation: () => void;
}

export function StatusBar({ meta, error, shipCount, locationName, isDefaultLocation, onRequestLocation }: Props) {
  let dotClass = "dot dot-green";
  let statusText = "Live";

  if (error) {
    dotClass = "dot dot-red";
    statusText = "Server unreachable";
  } else if (meta && !meta.connected) {
    dotClass = "dot dot-yellow";
    statusText = "AIS disconnected";
  }

  return (
    <div className="status-bar">
      <span className="status-left">
        <span className={dotClass} />
        {statusText} · {shipCount} ships
      </span>
      <span className="status-center">
        {locationName}
        {isDefaultLocation && navigator.geolocation && (
          <button className="location-btn" onClick={onRequestLocation} title="Use my location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
              <line x1="12" y1="2"  x2="12" y2="6"  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="2"  y1="12" x2="6"  y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="2.5"/>
              <circle cx="12" cy="12" r="3.5"/>
            </svg>
          </button>
        )}
      </span>
      <span className="status-right">
        {formatNow()}
      </span>
    </div>
  );
}
