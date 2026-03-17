import { useState } from "react";
import { useGeolocation } from "./hooks/useGeolocation";
import { useShips } from "./hooks/useShips";
import { StatusBar } from "./components/StatusBar";
import { FilterBar } from "./components/FilterBar";
import { ShipList } from "./components/ShipList";
import { ErrorState } from "./components/ErrorState";

export default function App() {
  const [filter, setFilter] = useState("all");
  const { location, locationName } = useGeolocation();
  const { ships, meta, isLoading, error } = useShips(filter, location);

  const neverLoaded = isLoading && !meta;

  if (neverLoaded && error) return <ErrorState />;

  return (
    <>
      <StatusBar meta={meta} error={error} shipCount={ships.length} />
      <div className="app">
        <header className="header">
          <h1 className="title">Schiffe</h1>
          <p className="subtitle">{locationName}</p>
        </header>
        <FilterBar active={filter} onChange={setFilter} />
        {isLoading && !meta ? (
          <p className="loading">Loading…</p>
        ) : (
          <ShipList ships={ships} />
        )}
      </div>
    </>
  );
}
