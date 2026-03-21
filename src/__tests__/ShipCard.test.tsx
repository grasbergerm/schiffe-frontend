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
