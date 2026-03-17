import { useState } from "react";
import { useShips } from "./hooks/useShips";
import { StatusBar } from "./components/StatusBar";
import { FilterBar } from "./components/FilterBar";
import { ShipList } from "./components/ShipList";
import { ErrorState } from "./components/ErrorState";

export default function App() {
  const [filter, setFilter] = useState("all");
  const { ships, meta, isLoading, error } = useShips(filter);

  const neverLoaded = isLoading && !meta;

  if (neverLoaded && error) return <ErrorState />;

  return (
    <>
      <StatusBar meta={meta} error={error} shipCount={ships.length} />
      <div className="app">
        <header className="header">
          <h1 className="title">Schiffe</h1>
          <p className="subtitle">Elbe · Blankenese</p>
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
