import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorState } from "../components/ErrorState";
import { FilterBar } from "../components/FilterBar";
import { ShipSizeIcon } from "../components/ShipSizeIcon";
import { StatusBar } from "../components/StatusBar";
import { WatchMode } from "../components/WatchMode";
import type { ShipData } from "../types";

// ── ErrorState ────────────────────────────────────────────────────────────────

describe("ErrorState", () => {
  it("renders the error message", () => {
    render(<ErrorState />);
    expect(screen.getByText("Unable to load ship data")).toBeInTheDocument();
  });
});

// ── FilterBar ─────────────────────────────────────────────────────────────────

describe("FilterBar", () => {
  it("renders all filter options", () => {
    const onChange = vi.fn();
    render(<FilterBar active="all" onChange={onChange} movingOnly={false} onMovingOnlyChange={vi.fn()} />);
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText(/Cargo/)).toBeInTheDocument();
    expect(screen.getByText(/Tanker/)).toBeInTheDocument();
    expect(screen.getByText(/Passenger/)).toBeInTheDocument();
    expect(screen.getByText(/Other/)).toBeInTheDocument();
  });

  it("calls onChange with the clicked value when filter is not active", () => {
    const onChange = vi.fn();
    render(<FilterBar active="all" onChange={onChange} movingOnly={false} onMovingOnlyChange={vi.fn()} />);
    fireEvent.click(screen.getByText(/Cargo/));
    expect(onChange).toHaveBeenCalledWith("cargo");
  });

  it("calls onChange with 'tanker' when Tanker is clicked", () => {
    const onChange = vi.fn();
    render(<FilterBar active="all" onChange={onChange} movingOnly={false} onMovingOnlyChange={vi.fn()} />);
    fireEvent.click(screen.getByText(/Tanker/));
    expect(onChange).toHaveBeenCalledWith("tanker");
  });

  it("calls onChange with 'passenger' when Passenger is clicked", () => {
    const onChange = vi.fn();
    render(<FilterBar active="all" onChange={onChange} movingOnly={false} onMovingOnlyChange={vi.fn()} />);
    fireEvent.click(screen.getByText(/Passenger/));
    expect(onChange).toHaveBeenCalledWith("passenger");
  });

  it("calls onChange with 'other' when Other is clicked", () => {
    const onChange = vi.fn();
    render(<FilterBar active="all" onChange={onChange} movingOnly={false} onMovingOnlyChange={vi.fn()} />);
    fireEvent.click(screen.getByText(/Other/));
    expect(onChange).toHaveBeenCalledWith("other");
  });

  it("calls onChange with 'all' when clicking the active filter", () => {
    const onChange = vi.fn();
    render(<FilterBar active="cargo" onChange={onChange} movingOnly={false} onMovingOnlyChange={vi.fn()} />);
    fireEvent.click(screen.getByText(/Cargo/));
    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("moving only button calls onMovingOnlyChange", () => {
    const onMovingOnlyChange = vi.fn();
    render(<FilterBar active="all" onChange={vi.fn()} movingOnly={false} onMovingOnlyChange={onMovingOnlyChange} />);
    fireEvent.click(screen.getByText(/Moving/));
    expect(onMovingOnlyChange).toHaveBeenCalledWith(true);
  });

  it("moving only button has active class when movingOnly is true", () => {
    render(<FilterBar active="all" onChange={vi.fn()} movingOnly={true} onMovingOnlyChange={vi.fn()} />);
    const btn = screen.getByText(/Moving/).closest("button");
    expect(btn?.className).toContain("filter-pill-active");
  });

  it("moving only button does NOT have active class when movingOnly is false", () => {
    render(<FilterBar active="all" onChange={vi.fn()} movingOnly={false} onMovingOnlyChange={vi.fn()} />);
    const btn = screen.getByText(/Moving/).closest("button");
    expect(btn?.className).not.toContain("filter-pill-active");
  });
});

// ── ShipSizeIcon ──────────────────────────────────────────────────────────────

describe("ShipSizeIcon", () => {
  it("returns null when length or width is null", () => {
    const { container } = render(<ShipSizeIcon length={null} width={null} category="cargo" />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when length is present but width is null (kills !length && !width mutation)", () => {
    // Mutation !length && !width: null && !null = false → wouldn't return null → renders SVG
    // Original !length || !width: !120 || !null = false || true = true → returns null
    const { container } = render(<ShipSizeIcon length={120} width={null} category="cargo" />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when width is present but length is null", () => {
    const { container } = render(<ShipSizeIcon length={null} width={20} category="cargo" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders an SVG when length and width are provided", () => {
    const { container } = render(<ShipSizeIcon length={120} width={20} category="cargo" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("respects minimum dimensions (length=1 → iconW=8, width=1 → iconH=2)", () => {
    const { container } = render(<ShipSizeIcon length={1} width={1} category="other" />);
    const svg = container.querySelector("svg") as SVGElement;
    expect(Number(svg.getAttribute("width"))).toBe(8);
    expect(Number(svg.getAttribute("height"))).toBe(2);
  });

  it("scales dimensions above minimum correctly (length=90 → iconW=60)", () => {
    // SCALE = 40/60. Math.round(90 * 40/60) = Math.round(60) = 60. Math.max(8, 60) = 60.
    const { container } = render(<ShipSizeIcon length={90} width={30} category="cargo" />);
    const svg = container.querySelector("svg") as SVGElement;
    expect(Number(svg.getAttribute("width"))).toBe(60);
  });

  it("uses the correct fill color for cargo category", () => {
    const { container } = render(<ShipSizeIcon length={60} width={15} category="cargo" />);
    const path = container.querySelector("path") as SVGPathElement;
    expect(path.getAttribute("fill")).toBe("var(--cargo)");
  });

  it("uses the correct fill color for tanker category", () => {
    const { container } = render(<ShipSizeIcon length={60} width={15} category="tanker" />);
    const path = container.querySelector("path") as SVGPathElement;
    expect(path.getAttribute("fill")).toBe("var(--tanker)");
  });
});

// ── StatusBar ─────────────────────────────────────────────────────────────────

describe("StatusBar", () => {
  it("shows 'Live' with green dot when no error and AIS connected", () => {
    render(<StatusBar meta={{ count: 5, updatedAt: new Date().toISOString(), connected: true }} error={null} shipCount={5} />);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("shows 'Server unreachable' with red dot when error is set", () => {
    render(<StatusBar meta={null} error="Network error" shipCount={0} />);
    expect(screen.getByText("Server unreachable")).toBeInTheDocument();
  });

  it("shows 'AIS disconnected' with yellow dot when meta.connected is false", () => {
    render(<StatusBar meta={{ count: 0, updatedAt: new Date().toISOString(), connected: false }} error={null} shipCount={0} />);
    expect(screen.getByText("AIS disconnected")).toBeInTheDocument();
  });

  it("shows ship count", () => {
    render(<StatusBar meta={null} error={null} shipCount={42} />);
    expect(screen.getByText(/42 ships/)).toBeInTheDocument();
  });
});

// ── WatchMode ─────────────────────────────────────────────────────────────────

function makeShip(overrides: Partial<ShipData> = {}): ShipData {
  return {
    mmsi: 211000001, name: "ELBE STAR", shipType: 70,
    lat: 53.5565, lon: 9.8063, speed: 5.2, heading: 180,
    navStatus: 5, destination: "DEHAM", length: 120, width: 20,
    distance: 1.5, lastUpdate: new Date().toISOString(),
    ...overrides,
  };
}

describe("WatchMode", () => {
  it("renders ship name and close button", () => {
    render(<WatchMode ship={makeShip()} onClose={vi.fn()} />);
    expect(screen.getByText("ELBE STAR")).toBeInTheDocument();
    expect(screen.getByText("✕")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<WatchMode ship={makeShip()} onClose={onClose} />);
    fireEvent.click(screen.getByText("✕"));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows destination when resolved", () => {
    render(<WatchMode ship={makeShip({ destination: "DEHAM" })} onClose={vi.fn()} />);
    expect(screen.getByText(/Hamburg/)).toBeInTheDocument();
  });

  it("shows 'Unknown' when ship name is empty", () => {
    render(<WatchMode ship={makeShip({ name: "" })} onClose={vi.fn()} />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("shows photo link when photo loads successfully (onLoad fires)", () => {
    render(<WatchMode ship={makeShip()} onClose={vi.fn()} />);
    const img = document.querySelector(".watch-mode-photo-probe") as HTMLImageElement;
    // Simulate image load → photoStatus becomes 'found' → shows photo link
    fireEvent.load(img);
    expect(document.querySelector(".watch-mode-photo-link")).not.toBeNull();
  });

  it("shows no photo link when photo errors", () => {
    render(<WatchMode ship={makeShip()} onClose={vi.fn()} />);
    const img = document.querySelector(".watch-mode-photo-probe") as HTMLImageElement;
    fireEvent.error(img);
    expect(document.querySelector(".watch-mode-photo-link")).toBeNull();
  });

  it("shows status badge when navStatus is set", () => {
    render(<WatchMode ship={makeShip({ navStatus: 5 })} onClose={vi.fn()} />);
    expect(screen.getByText("Moored")).toBeInTheDocument();
  });
});
