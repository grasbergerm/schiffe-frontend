import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShipList } from "../components/ShipList";
import type { ShipData } from "../types";

function makeShip(mmsi: number, name: string, distance: number): ShipData {
  return {
    mmsi,
    name,
    shipType: 70,
    lat: 53.5,
    lon: 9.8,
    speed: 0,
    heading: 511,
    navStatus: 0,
    destination: null,
    length: null,
    width: null,
    distance,
    lastUpdate: new Date().toISOString(),
  };
}

// Pre-sorted by distance (nearest first), as ShipList receives them
const ships = [makeShip(111000000, "ALPHA", 100), makeShip(222000000, "BETA", 200)];

describe("ShipList — highlight follows selected card", () => {
  it("initially highlights the first card (nearest)", () => {
    render(<ShipList ships={ships} />);
    const cards = document.querySelectorAll(".ship-card");
    expect(cards[0].className).toContain("ship-card-nearest");
    expect(cards[1].className).not.toContain("ship-card-nearest");
  });

  it("moves highlight to clicked card", async () => {
    render(<ShipList ships={ships} />);
    await userEvent.click(screen.getByText("BETA"));
    const cards = document.querySelectorAll(".ship-card");
    expect(cards[0].className).not.toContain("ship-card-nearest");
    expect(cards[1].className).toContain("ship-card-nearest");
  });

  it("returns highlight to first card when selected card is collapsed", async () => {
    render(<ShipList ships={ships} />);
    await userEvent.click(screen.getByText("BETA"));
    await userEvent.click(screen.getByText("BETA")); // collapse
    const cards = document.querySelectorAll(".ship-card");
    expect(cards[0].className).toContain("ship-card-nearest");
    expect(cards[1].className).not.toContain("ship-card-nearest");
  });
});
