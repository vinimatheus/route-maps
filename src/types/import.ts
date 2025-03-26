export type ImportStep = "upload" | "map-columns" | "geocode" | "map";

export interface ParsedAddress {
  id: string;
  cep: string;
  displayInfo: Record<string, string | number | boolean | null>;
  isGeocoded: boolean;
  lat?: number;
  lng?: number;
  formattedAddress?: string;
  error?: string;
}

export interface LeafletMapProps {
  waypoints: (ParsedAddress & { lat: number; lng: number })[];
  routeKey: number;
  showOrderNumbers?: boolean;
  onPinClick?: (address: ParsedAddress) => void;
}
