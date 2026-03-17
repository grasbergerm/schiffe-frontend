import { useState, useEffect, useRef } from "react";
import type { ShipData, ApiMeta, ApiResponse } from "../types";
import { getShipTypeInfo } from "../utils/shipTypes";

const API_URL = import.meta.env.VITE_API_URL;
const POLL_INTERVAL_MS = 15_000;

interface Location { lat: number; lon: number; }

interface UseShipsReturn {
  ships: ShipData[];
  meta: ApiMeta | null;
  isLoading: boolean;
  error: string | null;
}

export function useShips(filter: string, location: Location): UseShipsReturn {
  const [ships, setShips] = useState<ShipData[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasEverLoaded = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchShips() {
      try {
        const res = await fetch(`${API_URL}/ships?lat=${location.lat}&lon=${location.lon}`);
        if (!res.ok) throw new Error(`Server error (${res.status})`);

        const data: ApiResponse = await res.json();

        if (cancelled) return;

        hasEverLoaded.current = true;
        setShips(data.ships);
        setMeta(data.meta);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;

        const msg = err instanceof Error && err.message.startsWith("Server error")
          ? err.message
          : "Unable to reach the server";

        setError(msg);
        if (!hasEverLoaded.current) {
          setIsLoading(false);
        }
        // Keep last known ships if we have them
      }
    }

    fetchShips();
    const interval = setInterval(fetchShips, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [location.lat, location.lon]);

  const filtered = filter === "all"
    ? ships
    : ships.filter((s) => getShipTypeInfo(s.shipType).category === filter);

  return { ships: filtered, meta, isLoading, error };
}
