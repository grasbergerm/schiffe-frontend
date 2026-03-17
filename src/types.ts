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
