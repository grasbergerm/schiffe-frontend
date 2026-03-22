import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useShips } from "../hooks/useShips";
import type { ShipData, ApiMeta } from "../types";

// Mock EventSource globally
class MockEventSource {
  static instances: MockEventSource[] = [];
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  close = vi.fn();

  url: string;
  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  dispatchMessage(data: { ships: ShipData[]; meta: ApiMeta }) {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent);
  }

  dispatchError() {
    this.onerror?.(new Event("error"));
  }
}

const location = { lat: 53.5565, lon: 9.8063 };

function makeShip(overrides: Partial<ShipData> = {}): ShipData {
  return {
    mmsi: 123456789, name: "TEST SHIP", shipType: 70,
    lat: 53.5565, lon: 9.8063, speed: 5.2, heading: 180,
    navStatus: null, destination: null, length: null, width: null,
    distance: 1.5, lastUpdate: new Date().toISOString(),
    ...overrides,
  };
}

function makeMeta(overrides: Partial<ApiMeta> = {}): ApiMeta {
  return { count: 1, updatedAt: new Date().toISOString(), connected: true, ...overrides };
}

beforeEach(() => {
  MockEventSource.instances = [];
  vi.stubGlobal("EventSource", MockEventSource);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useShips", () => {
  it("starts in loading state with no ships", () => {
    const { result } = renderHook(() => useShips("all", location, false));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.ships).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.meta).toBeNull();
  });

  it("creates an EventSource with the correct URL", () => {
    renderHook(() => useShips("all", location, false));
    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toContain("lat=53.5565");
    expect(MockEventSource.instances[0].url).toContain("lon=9.8063");
  });

  it("updates ships and meta on message, sets isLoading=false", () => {
    const { result } = renderHook(() => useShips("all", location, false));
    const source = MockEventSource.instances[0];

    act(() => {
      source.dispatchMessage({ ships: [makeShip()], meta: makeMeta() });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.ships).toHaveLength(1);
    expect(result.current.meta).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("sets error on EventSource error (before first load)", () => {
    const { result } = renderHook(() => useShips("all", location, false));
    const source = MockEventSource.instances[0];

    act(() => {
      source.dispatchError();
    });

    expect(result.current.error).toBe("Unable to reach the server");
    expect(result.current.isLoading).toBe(false);
  });

  it("keeps last ships after error (does not clear ships on reconnect error)", () => {
    const { result } = renderHook(() => useShips("all", location, false));
    const source = MockEventSource.instances[0];

    act(() => {
      source.dispatchMessage({ ships: [makeShip()], meta: makeMeta() });
    });
    expect(result.current.ships).toHaveLength(1);

    act(() => {
      source.dispatchError();
    });
    // Ships should be kept (EventSource auto-reconnects)
    expect(result.current.ships).toHaveLength(1);
    // But error should be set
    expect(result.current.error).toBe("Unable to reach the server");
  });

  it("filters ships by category", () => {
    const { result } = renderHook(() => useShips("cargo", location, false));
    const source = MockEventSource.instances[0];

    act(() => {
      source.dispatchMessage({
        ships: [
          makeShip({ mmsi: 1, shipType: 70 }),  // cargo
          makeShip({ mmsi: 2, shipType: 80 }),  // tanker
        ],
        meta: makeMeta({ count: 2 }),
      });
    });

    expect(result.current.ships).toHaveLength(1);
    expect(result.current.ships[0].mmsi).toBe(1);
  });

  it("filters ships by movingOnly (speed >= 0.5)", () => {
    const { result } = renderHook(() => useShips("all", location, true));
    const source = MockEventSource.instances[0];

    act(() => {
      source.dispatchMessage({
        ships: [
          makeShip({ mmsi: 1, speed: 5.0 }),  // moving
          makeShip({ mmsi: 2, speed: 0.0 }),  // stationary
        ],
        meta: makeMeta({ count: 2 }),
      });
    });

    expect(result.current.ships).toHaveLength(1);
    expect(result.current.ships[0].mmsi).toBe(1);
  });

  it("movingOnly=false does NOT filter slow ships (kills if(true) mutation)", () => {
    // If movingOnly=false, slow ships must still be included.
    // Mutation `if (true)` would filter regardless → slow ship excluded → test fails.
    const { result } = renderHook(() => useShips("all", location, false));
    const source = MockEventSource.instances[0];

    act(() => {
      source.dispatchMessage({
        ships: [makeShip({ mmsi: 1, speed: 0.2 })],
        meta: makeMeta({ count: 1 }),
      });
    });

    expect(result.current.ships).toHaveLength(1);
  });

  it("ship with speed exactly 0.5 is included when movingOnly=true (kills >= → > mutation)", () => {
    const { result } = renderHook(() => useShips("all", location, true));
    const source = MockEventSource.instances[0];

    act(() => {
      source.dispatchMessage({
        ships: [makeShip({ mmsi: 1, speed: 0.5 })],
        meta: makeMeta({ count: 1 }),
      });
    });

    expect(result.current.ships).toHaveLength(1);
  });

  it("closes EventSource on unmount", () => {
    const { unmount } = renderHook(() => useShips("all", location, false));
    const source = MockEventSource.instances[0];
    unmount();
    expect(source.close).toHaveBeenCalled();
  });

  it("creates a new EventSource when location changes", () => {
    const { rerender } = renderHook(
      ({ loc }) => useShips("all", loc, false),
      { initialProps: { loc: { lat: 53.5565, lon: 9.8063 } } }
    );
    expect(MockEventSource.instances).toHaveLength(1);

    // Change location
    rerender({ loc: { lat: -34.6037, lon: -58.3816 } });
    expect(MockEventSource.instances).toHaveLength(2);
  });

  it("error after first load does not set isLoading=false again", () => {
    const { result } = renderHook(() => useShips("all", location, false));
    const source = MockEventSource.instances[0];

    // First load
    act(() => {
      source.dispatchMessage({ ships: [makeShip()], meta: makeMeta() });
    });
    expect(result.current.isLoading).toBe(false);

    // Error after load — isLoading stays false
    act(() => {
      source.dispatchError();
    });
    expect(result.current.isLoading).toBe(false);
  });
});
