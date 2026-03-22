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
        {error ? statusText : `${statusText} · ${shipCount} ships`}
      </span>
      <span className="status-center">
        {locationName}
        {isDefaultLocation && navigator.geolocation && (
          <button className="location-btn" onClick={onRequestLocation} title="Use my location">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              {/* top arm */}
              <rect x="6" y="1" width="2" height="4"/>
              {/* bottom arm */}
              <rect x="6" y="9" width="2" height="4"/>
              {/* left arm */}
              <rect x="1" y="6" width="4" height="2"/>
              {/* right arm */}
              <rect x="9" y="6" width="4" height="2"/>
              {/* center dot */}
              <rect x="6" y="6" width="2" height="2"/>
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
