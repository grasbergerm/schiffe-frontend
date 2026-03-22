import { StrictMode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useGeolocation } from "../hooks/useGeolocation";

// ── Geolocation mock helpers ──────────────────────────────────────────────────
// jsdom does not define navigator.geolocation, so we use Object.defineProperty
// instead of vi.spyOn (which requires the property to already exist).

function setNavigatorGeolocation(geo: Geolocation | undefined) {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: geo,
  });
}

function mockGeoSuccess(lat: number, lon: number) {
  setNavigatorGeolocation({
    getCurrentPosition: vi.fn((success) =>
      success({ coords: { latitude: lat, longitude: lon } } as GeolocationPosition)
    ),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  });
}

function mockGeoError() {
  setNavigatorGeolocation({
    getCurrentPosition: vi.fn((_success, error) =>
      error?.({ code: 1, message: "Denied" } as GeolocationPositionError)
    ),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  });
}

function mockGeoUnavailable() {
  setNavigatorGeolocation(undefined);
}

// ── Fetch mock ────────────────────────────────────────────────────────────────

// Nominatim response
function nominatimResponse(suburb: string) {
  return Promise.resolve(
    new Response(JSON.stringify({ address: { suburb } }), { status: 200 })
  );
}

// Overpass response (waterway)
function overpassResponse(name: string) {
  return Promise.resolve(
    new Response(
      JSON.stringify({ elements: [{ tags: { name } }] }),
      { status: 200 }
    )
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useGeolocation — default / fallback state", () => {
  it("returns Blankenese and isDefaultLocation=true before geolocation resolves", () => {
    // Geolocation available but getCurrentPosition never calls back (simulates pending prompt)
    setNavigatorGeolocation({
      getCurrentPosition: vi.fn(), // never calls back
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    });

    const { result } = renderHook(() => useGeolocation());
    expect(result.current.location).toEqual({ lat: 53.5565, lon: 9.8063 });
    expect(result.current.locationName).toBe("Elbe · Blankenese");
    expect(result.current.isDefaultLocation).toBe(true);
  });

  it("returns Blankenese and isDefaultLocation=true when geolocation is unavailable", () => {
    mockGeoUnavailable();
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.location).toEqual({ lat: 53.5565, lon: 9.8063 });
    expect(result.current.isDefaultLocation).toBe(true);
  });

  it("stays on Blankenese when permission is denied", async () => {
    mockGeoError();
    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => {
      expect(result.current.isDefaultLocation).toBe(true);
    });
    expect(result.current.location).toEqual({ lat: 53.5565, lon: 9.8063 });
  });
});

describe("useGeolocation — successful location", () => {
  it("updates location and sets isDefaultLocation=false on success", async () => {
    mockGeoSuccess(53.56, 9.81);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ address: { suburb: "Ottensen" } }), { status: 200 })
    ));

    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.isDefaultLocation).toBe(false));
    expect(result.current.location).toEqual({ lat: 53.56, lon: 9.81 });
  });

  it("sets locationName from suburb when waterway is absent", async () => {
    mockGeoSuccess(53.56, 9.81);
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (String(url).includes("nominatim")) return nominatimResponse("Ottensen");
      return overpassResponse(""); // empty waterway name → only suburb shown
    }));

    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.locationName).toBe("Ottensen"));
  });

  it("combines waterway and suburb into locationName", async () => {
    mockGeoSuccess(53.56, 9.81);
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (String(url).includes("nominatim")) return nominatimResponse("Altona");
      return overpassResponse("Elbe");
    }));

    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.locationName).toBe("Elbe · Altona"));
  });

  it("sets locationName from waterway only when suburb is absent", async () => {
    mockGeoSuccess(53.56, 9.81);
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (String(url).includes("nominatim"))
        return Promise.resolve(new Response(JSON.stringify({ address: {} }), { status: 200 }));
      return overpassResponse("Elbe");
    }));

    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.locationName).toBe("Elbe"));
  });

  it("falls back to 'Near you' when reverse geocoding fails", async () => {
    mockGeoSuccess(53.56, 9.81);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));

    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.locationName).toBe("Near you"));
  });

  it("falls back to 'Near you' when both APIs return non-ok responses", async () => {
    mockGeoSuccess(53.56, 9.81);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));

    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.locationName).toBe("Near you"));
  });

  it("falls back to 'Near you' when Nominatim returns non-ok with valid JSON (kills if(false) mutation)", async () => {
    // With mutation `if (false)`, the throw is removed → data parsed as valid address → place="Test".
    // With original code, status=500 → throws → .catch(() => "") → place="".
    // Waterway returns empty → both empty → "Near you".
    mockGeoSuccess(53.56, 9.81);
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (String(url).includes("nominatim"))
        return Promise.resolve(new Response(JSON.stringify({ address: { suburb: "Test" } }), { status: 500 }));
      return Promise.resolve(new Response(JSON.stringify({ elements: [] }), { status: 200 }));
    }));
    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.locationName).toBe("Near you"));
  });

  it("shows suburb only when Overpass returns non-ok with valid JSON (kills Overpass if(false) mutation)", async () => {
    // With mutation `if (false)` for Overpass, throw removed → waterway="TestWay" → "TestWay · Ottensen".
    // With original, status=500 → throws → .catch(() => "") → waterway="" → "Ottensen".
    mockGeoSuccess(53.56, 9.81);
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (String(url).includes("nominatim")) return nominatimResponse("Ottensen");
      return Promise.resolve(new Response(
        JSON.stringify({ elements: [{ tags: { name: "TestWay" } }] }),
        { status: 500 }
      ));
    }));
    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.locationName).toBe("Ottensen"));
  });

  it("handles missing address field in Nominatim response (uses suburb fallbacks)", async () => {
    mockGeoSuccess(53.56, 9.81);
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (String(url).includes("nominatim"))
        // No address field → data.address ?? {} = {} → all fallbacks empty → place = ""
        return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
      return overpassResponse("Elbe");
    }));

    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.locationName).toBe("Elbe"));
  });

  it("handles empty elements array in Overpass response", async () => {
    mockGeoSuccess(53.56, 9.81);
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (String(url).includes("nominatim")) return nominatimResponse("Altona");
      // Empty elements → data.elements?.[0] is undefined → waterway = ""
      return Promise.resolve(new Response(JSON.stringify({ elements: [] }), { status: 200 }));
    }));

    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.locationName).toBe("Altona"));
  });

  it("works with Argentine coordinates (negative lat/lon)", async () => {
    mockGeoSuccess(-34.6037, -58.3816);
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (String(url).includes("nominatim")) return nominatimResponse("Palermo");
      return overpassResponse("Río de la Plata");
    }));

    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.isDefaultLocation).toBe(false));
    expect(result.current.location).toEqual({ lat: -34.6037, lon: -58.3816 });
    await waitFor(() => expect(result.current.locationName).toBe("Río de la Plata · Palermo"));
  });
});

describe("requestLocation", () => {
  it("is a function exposed by the hook", () => {
    mockGeoUnavailable();
    const { result } = renderHook(() => useGeolocation());
    expect(typeof result.current.requestLocation).toBe("function");
  });

  it("triggers geolocation again when called", async () => {
    const getCurrentPosition = vi.fn();
    setNavigatorGeolocation({
      getCurrentPosition,
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    });

    const { result } = renderHook(() => useGeolocation());
    // Called once on mount
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);

    act(() => { result.current.requestLocation(); });
    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
  });

  it("does not overwrite waterway when StrictMode double-fires the effect", async () => {
    mockGeoSuccess(53.56, 9.81);

    let overpassCallCount = 0;
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (String(url).includes("nominatim")) return nominatimResponse("Altona");
      overpassCallCount++;
      // First Overpass call: waterway found
      if (overpassCallCount === 1) return overpassResponse("Elbe");
      // Second Overpass call: rate-limited / empty (simulates StrictMode second fire)
      return Promise.resolve(new Response(JSON.stringify({ elements: [] }), { status: 200 }));
    }));

    const { result } = renderHook(() => useGeolocation(), { wrapper: StrictMode });

    await waitFor(() => expect(result.current.locationName).not.toBe("Elbe · Blankenese"));

    // Should preserve the waterway — not be overwritten by the rate-limited second call
    expect(result.current.locationName).toBe("Elbe · Altona");
  });

  it("updates location and clears isDefaultLocation after manual retry succeeds", async () => {
    // First call: deny. Second call (manual retry): succeed.
    let callCount = 0;
    setNavigatorGeolocation({
      getCurrentPosition: vi.fn((success, error) => {
        callCount++;
        if (callCount === 1) {
          error?.({ code: 1, message: "Denied" } as GeolocationPositionError);
        } else {
          success({ coords: { latitude: -34.6037, longitude: -58.3816 } } as GeolocationPosition);
        }
      }),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ address: { suburb: "Palermo" } }), { status: 200 })
    ));

    const { result } = renderHook(() => useGeolocation());
    expect(result.current.isDefaultLocation).toBe(true);

    act(() => { result.current.requestLocation(); });
    await waitFor(() => expect(result.current.isDefaultLocation).toBe(false));
    expect(result.current.location).toEqual({ lat: -34.6037, lon: -58.3816 });
  });
});
