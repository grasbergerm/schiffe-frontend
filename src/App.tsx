import { useState } from "react";
import { useGeolocation } from "./hooks/useGeolocation";
import { useShips } from "./hooks/useShips";
import { StatusBar } from "./components/StatusBar";
import { FilterBar } from "./components/FilterBar";
import { ShipList } from "./components/ShipList";
import { WatchMode } from "./components/WatchMode";
import { ErrorState } from "./components/ErrorState";

export default function App() {
  const [filter, setFilter] = useState("all");
  const [movingOnly, setMovingOnly] = useState(false);
  const [watchMode, setWatchMode] = useState(false);
  const { location, locationName, isDefaultLocation, requestLocation } = useGeolocation();
  const { ships, meta, isLoading, error } = useShips(filter, location, movingOnly);

  const neverLoaded = isLoading && !meta;

  if (neverLoaded && error) return <ErrorState />;

  if (watchMode && ships[0]) {
    return <WatchMode ship={ships[0]} onClose={() => setWatchMode(false)} />;
  }

  return (
    <>
      <StatusBar meta={meta} error={error} shipCount={ships.length} />
      <div className="app">
        <header className="header">
          <div className="header-row">
            <h1 className="title">Schiffe</h1>
            {ships.length > 0 && (
              <button className="watch-btn" onClick={() => setWatchMode(true)}>
                👁
              </button>
            )}
          </div>
          <span className="subtitle-row">
            <p className="subtitle">{locationName}</p>
            {isDefaultLocation && navigator.geolocation && (
              <button className="location-btn" onClick={requestLocation} title="Use my location">📍</button>
            )}
          </span>
        </header>
        <FilterBar
          active={filter}
          onChange={setFilter}
          movingOnly={movingOnly}
          onMovingOnlyChange={setMovingOnly}
        />
        {isLoading && !meta ? (
          <p className="loading">Loading…</p>
        ) : (
          <ShipList ships={ships} />
        )}
      </div>
    </>
  );
}
