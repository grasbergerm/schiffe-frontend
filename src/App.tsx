import { useState, useRef } from "react";
import { useGeolocation } from "./hooks/useGeolocation";
import { useShips } from "./hooks/useShips";
import { StatusBar } from "./components/StatusBar";
import { FilterBar } from "./components/FilterBar";
import { ShipList } from "./components/ShipList";
import { WatchMode } from "./components/WatchMode";
import { ErrorState } from "./components/ErrorState";
import { MapCanvas } from "./components/MapCanvas";

export default function App() {
  const [filter, setFilter] = useState("all");
  const [movingOnly, setMovingOnly] = useState(false);
  const [watchMode, setWatchMode] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [rotation, setRotation] = useState(0);
  const dragX      = useRef<number | null>(null);
  const dragAccum  = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragX.current     = e.clientX;
    dragAccum.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragX.current === null) return;
    const delta = e.clientX - dragX.current;
    dragX.current = e.clientX;
    dragAccum.current += delta * 0.5;
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = `rotate(${dragAccum.current}deg)`;
    }
  };
  const handlePointerUp = () => {
    if (dragX.current === null) return;
    dragX.current = null;
    const accum = dragAccum.current;
    dragAccum.current = 0;
    if (wrapperRef.current) wrapperRef.current.style.transform = '';
    setRotation(r => (r + accum + 36000) % 360);
  };

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
      <div className="layout">
        <div
          className="map-pane"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div ref={wrapperRef} style={{ position: 'absolute', inset: '-20.9375%' }}>
            <MapCanvas
              lat={location.lat}
              lon={location.lon}
              flipped={flipped}
              bearing={rotation}
            />
          </div>
          <button
            className="map-north-btn"
            onClick={() => setRotation(0)}
            title="Reset to north"
          >N↑</button>
          <button
            className="map-flip-btn"
            onClick={() => setFlipped(f => !f)}
            title="Flip view"
          >↕</button>
          <span className="map-rotate-hint">← drag to rotate →</span>
        </div>
        <div className="list-pane">
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
                <button className="location-btn" onClick={requestLocation} title="Use my location">
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
          </header>
          <FilterBar
            active={filter}
            onChange={setFilter}
            movingOnly={movingOnly}
            onMovingOnlyChange={setMovingOnly}
          />
          {neverLoaded ? (
            <p className="loading">Loading…</p>
          ) : (
            <ShipList ships={ships} />
          )}
        </div>
      </div>
    </>
  );
}
