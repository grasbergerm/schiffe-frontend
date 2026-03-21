import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShipCard } from "../components/ShipCard";
import type { ShipData } from "../types";

function makeShip(overrides: Partial<ShipData> = {}): ShipData {
  return {
    mmsi: 123456789, name: "TEST SHIP", shipType: 70,
    lat: 53.5565, lon: 9.8063, speed: 5.2, heading: 180,
    navStatus: null, destination: null, length: null, width: null,
    distance: 1.5, lastUpdate: new Date().toISOString(),
    ...overrides,
  };
}

describe("ShipCard — branch coverage", () => {
  it("shows flag emoji for German ship (MMSI 211000001)", () => {
    render(<ShipCard ship={makeShip({ mmsi: 211000001, shipType: 70 })} isNearest={false} expanded={false} onToggle={vi.fn()} />);
    // German flag 🇩🇪 should appear
    expect(screen.getByText(/🇩🇪/)).toBeInTheDocument();
  });

  it("shows status badge when navStatus indicates moored", () => {
    render(<ShipCard ship={makeShip({ navStatus: 5 })} isNearest={false} expanded={false} onToggle={vi.fn()} />);
    expect(screen.getByText("Moored")).toBeInTheDocument();
  });

  it("shows size row in expanded card when length and width are set", () => {
    render(<ShipCard ship={makeShip({ length: 120, width: 20 })} isNearest={false} expanded={true} onToggle={vi.fn()} />);
    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByText("120 × 20 m")).toBeInTheDocument();
  });

  it("does NOT show size row in expanded card when width is null (kills length && width → || mutation)", () => {
    render(<ShipCard ship={makeShip({ length: 120, width: null })} isNearest={false} expanded={true} onToggle={vi.fn()} />);
    expect(screen.queryByText("Size")).not.toBeInTheDocument();
  });

  it("shows destination in expanded card", () => {
    render(<ShipCard ship={makeShip({ destination: "DEHAM" })} isNearest={false} expanded={true} onToggle={vi.fn()} />);
    expect(screen.getByText("Destination")).toBeInTheDocument();
  });

  it("shows 'Unknown' when ship name is empty string", () => {
    render(<ShipCard ship={makeShip({ name: "" })} isNearest={false} expanded={false} onToggle={vi.fn()} />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("adds ship-card-nearest class when isNearest=true", () => {
    const { container } = render(<ShipCard ship={makeShip()} isNearest={true} expanded={false} onToggle={vi.fn()} />);
    expect(container.querySelector(".ship-card-nearest")).not.toBeNull();
  });

  it("does not add ship-card-nearest class when isNearest=false", () => {
    const { container } = render(<ShipCard ship={makeShip()} isNearest={false} expanded={false} onToggle={vi.fn()} />);
    expect(container.querySelector(".ship-card-nearest")).toBeNull();
  });

  it("shows heading degrees in speed row when heading is not 511", () => {
    render(<ShipCard ship={makeShip({ heading: 90 })} isNearest={false} expanded={true} onToggle={vi.fn()} />);
    expect(screen.getByText(/90°/)).toBeInTheDocument();
  });

  it("does NOT show heading degrees when heading is 511", () => {
    render(<ShipCard ship={makeShip({ heading: 511 })} isNearest={false} expanded={true} onToggle={vi.fn()} />);
    expect(screen.queryByText(/511°/)).not.toBeInTheDocument();
  });
});

describe("ShipCard — expanded Type row", () => {
  it("shows 'Type' label and 'Cargo' value when expanded with shipType 70", () => {
    render(<ShipCard ship={makeShip({ shipType: 70 })} isNearest={false} expanded={true} onToggle={vi.fn()} />);
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Cargo")).toBeInTheDocument();
  });

  it("shows 'Unknown' type label when shipType is null", () => {
    render(<ShipCard ship={makeShip({ shipType: null })} isNearest={false} expanded={true} onToggle={vi.fn()} />);
    const typeLabel = screen.getByText("Type");
    expect(typeLabel.closest(".detail-row")).toHaveTextContent("Unknown");
  });

  it("does not show 'Type' row when card is not expanded", () => {
    render(<ShipCard ship={makeShip()} isNearest={false} expanded={false} onToggle={vi.fn()} />);
    expect(screen.queryByText("Type")).not.toBeInTheDocument();
  });
});

describe("ShipCard — expanded Flag row", () => {
  it("shows country name in expanded card for known flag (German ship)", () => {
    render(<ShipCard ship={makeShip({ mmsi: 211000001 })} isNearest={false} expanded={true} onToggle={vi.fn()} />);
    expect(screen.getByText("Flag")).toBeInTheDocument();
    expect(screen.getByText(/Germany/)).toBeInTheDocument();
  });

  it("does not show Flag row when MMSI has no known country", () => {
    render(<ShipCard ship={makeShip({ mmsi: 100000001 })} isNearest={false} expanded={true} onToggle={vi.fn()} />);
    expect(screen.queryByText("Flag")).not.toBeInTheDocument();
  });
});
