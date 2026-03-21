import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { useGeolocation } from "../hooks/useGeolocation";
import { useShips } from "../hooks/useShips";

// ── Module mocks ──────────────────────────────────────────────────────────────

const mockRequestLocation = vi.fn();

vi.mock("../hooks/useGeolocation");
vi.mock("../hooks/useShips");

const defaultShips = {
  ships: [],
  meta: null,
  isLoading: false,
  error: null,
};

function setGeolocation(isDefault: boolean, locationName = "Elbe · Blankenese") {
  vi.mocked(useGeolocation).mockReturnValue({
    location: { lat: 53.5565, lon: 9.8063 },
    locationName,
    isDefaultLocation: isDefault,
    requestLocation: mockRequestLocation,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useShips).mockReturnValue(defaultShips);
  // App.tsx checks `navigator.geolocation` as a condition before rendering the
  // 📍 button. jsdom doesn't define it, so we stub it with a truthy object.
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { getCurrentPosition: vi.fn(), watchPosition: vi.fn(), clearWatch: vi.fn() },
  });
});

// ── 📍 button visibility ───────────────────────────────────────────────────────

describe("location retry button (📍)", () => {
  it("is visible when isDefaultLocation=true and geolocation is available", () => {
    setGeolocation(true);
    render(<App />);
    expect(screen.getByTitle("Use my location")).toBeInTheDocument();
  });

  it("is not visible when isDefaultLocation=false (real location obtained)", () => {
    setGeolocation(false);
    render(<App />);
    expect(screen.queryByTitle("Use my location")).not.toBeInTheDocument();
  });

  it("shows the subtitle text at all times", () => {
    setGeolocation(true, "Elbe · Blankenese");
    render(<App />);
    expect(screen.getByText("Elbe · Blankenese")).toBeInTheDocument();
  });

  it("shows updated subtitle after location is obtained", () => {
    setGeolocation(false, "Elbe · Altona");
    render(<App />);
    expect(screen.getByText("Elbe · Altona")).toBeInTheDocument();
  });

  it("calls requestLocation when the button is clicked", async () => {
    setGeolocation(true);
    render(<App />);
    await userEvent.click(screen.getByTitle("Use my location"));
    expect(mockRequestLocation).toHaveBeenCalledTimes(1);
  });

  it("button disappears after requestLocation succeeds (isDefaultLocation → false)", () => {
    setGeolocation(true);
    const { rerender } = render(<App />);
    expect(screen.getByTitle("Use my location")).toBeInTheDocument();

    setGeolocation(false, "Elbe · Altona");
    rerender(<App />);
    expect(screen.queryByTitle("Use my location")).not.toBeInTheDocument();
  });
});

// ── App structure ─────────────────────────────────────────────────────────────

describe("App structure", () => {
  it("renders the title Schiffe", () => {
    setGeolocation(false);
    render(<App />);
    expect(screen.getByText("Schiffe")).toBeInTheDocument();
  });

  it("shows loading state before first data arrives", () => {
    setGeolocation(false);
    vi.mocked(useShips).mockReturnValue({ ships: [], meta: null, isLoading: true, error: null });
    render(<App />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});
