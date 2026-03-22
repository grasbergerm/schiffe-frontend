import { useState, useEffect, useRef, useMemo } from "react";
import type { ShipData, ApiMeta, ApiResponse } from "../types";
import { getShipTypeInfo } from "../utils/shipTypes";

const API_URL = import.meta.env.VITE_API_URL;

interface Location { lat: number; lon: number; }

interface UseShipsReturn {
  ships: ShipData[];
  meta: ApiMeta | null;
  isLoading: boolean;
  error: string | null;
}

export function useShips(filter: string, location: Location, movingOnly: boolean): UseShipsReturn {
  const [ships, setShips] = useState<ShipData[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasEverLoaded = useRef(false);

  useEffect(() => {
    const source = new EventSource(
      `${API_URL}/ships/stream?lat=${location.lat}&lon=${location.lon}`
    );

    source.onmessage = (event) => {
      let data: ApiResponse;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      hasEverLoaded.current = true;
      setShips(data.ships);
      setMeta(data.meta);
      setError(null);
      setIsLoading(false);
    };

    source.onerror = () => {
      setError("Unable to reach the server");
      if (!hasEverLoaded.current) {
        setIsLoading(false);
      }
      // EventSource auto-reconnects; keep last known ships
    };

    return () => {
      source.close();
    };
  }, [location.lat, location.lon]);

  const filtered = useMemo(() => {
    let result = filter === "all"
      ? ships
      : ships.filter((s) => getShipTypeInfo(s.shipType).category === filter);
    if (movingOnly) result = result.filter((s) => s.speed >= 0.5);
    return result;
  }, [ships, filter, movingOnly]);

  return { ships: filtered, meta, isLoading, error };
}
