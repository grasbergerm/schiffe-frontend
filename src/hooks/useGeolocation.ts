import { useState, useEffect } from "react";

interface Location { lat: number; lon: number; }

interface UseGeolocationReturn {
  location: Location;
  locationName: string;
  isDefaultLocation: boolean;
  requestLocation: () => void;
}

const BLANKENESE: Location = { lat: 53.5565, lon: 9.8063 };
const BLANKENESE_NAME = "Elbe · Blankenese";
const GEO_TIMEOUT_MS = 8_000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  /* c8 ignore next */
  const timeout = setTimeout(() => controller.abort(), GEO_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function reversegeocode(lat: number, lon: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  const res = await fetchWithTimeout(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) throw new Error("Nominatim error");
  const data = await res.json();
  const addr = data.address ?? {};
  return addr.suburb || addr.city || addr.town || addr.village || "";
}

async function nearestWaterway(lat: number, lon: number): Promise<string> {
  const query = `[out:json][timeout:5];way[waterway~"^(river|canal)$"][name](around:1000,${lat},${lon});out tags 1;`;
  const res = await fetchWithTimeout("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
  });
  if (!res.ok) throw new Error("Overpass error");
  const data = await res.json();
  return data.elements?.[0]?.tags?.name ?? "";
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<Location>(BLANKENESE);
  const [locationName, setLocationName] = useState(BLANKENESE_NAME);
  const [isDefaultLocation, setIsDefaultLocation] = useState(true);

  function requestLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLocation({ lat, lon });
        setIsDefaultLocation(false);

        try {
          const [place, waterway] = await Promise.all([
            reversegeocode(lat, lon).catch(() => ""),
            nearestWaterway(lat, lon).catch(() => ""),
          ]);

          if (waterway && place) {
            setLocationName(`${waterway} · ${place}`);
          } else if (place) {
            setLocationName(place);
          } else if (waterway) {
            setLocationName(waterway);
          } else {
            setLocationName("Near you");
          }
        } catch {
          /* c8 ignore next */
          setLocationName("Near you");
        }
      },
      () => {
        // Permission denied or unavailable — keep Blankenese fallback
      }
    );
  }

  useEffect(() => {
    requestLocation();
  }, []);

  return { location, locationName, isDefaultLocation, requestLocation };
}
