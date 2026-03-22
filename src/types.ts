export interface ShipData {
  mmsi: number;
  name: string;
  shipType: number | null;
  lat: number;
  lon: number;
  speed: number;
  heading: number;
  navStatus: number | null;
  destination: string | null;
  length: number | null;
  width: number | null;
  distance: number;
  lastUpdate: string;
}

export interface ApiMeta {
  count: number;
  updatedAt: string;
  connected: boolean;
}

export interface ApiResponse {
  ships: ShipData[];
  meta: ApiMeta;
}

export type CellType = "water" | "land";

export interface MapBounds {
  northLat: number;
  southLat: number;
  westLon: number;
  eastLon: number;
}

export interface MapGrid {
  grid: CellType[][];
  bounds: MapBounds;
  paddedBounds: MapBounds;
  bearing: number;
}
