export interface RouteAddress {
  id: string;
  description: string;
  lat: number;
  lng: number;
  isGeocoded: boolean;
  deliveryOrder?: number;
  isChecked?: boolean;
  cep?: string;
}

export function sortAddressesByDeliveryOrder(addresses: RouteAddress[]): RouteAddress[] {
  return [...addresses].sort((a, b) => (a.deliveryOrder ?? 0) - (b.deliveryOrder ?? 0));
}

export function updateDeliveryOrder(addresses: RouteAddress[]): RouteAddress[] {
  return addresses.map((address, index) => ({
    ...address,
    deliveryOrder: index + 1,
  }));
}

export interface Waypoint {
  lat: number;
  lng: number;
  id: string;
  cep: string;
  description: string;
  formattedAddress: string;
  isGeocoded: boolean;
  displayInfo?: Record<string, string>;
}

export function createWaypoints(
  origin: RouteAddress,
  addresses: RouteAddress[],
  returnToOrigin: boolean
): Waypoint[] {
  const waypoints: Waypoint[] = [];

  const addWaypoint = (address: RouteAddress, suffix = "") => {
    waypoints.push({
      lat: address.lat,
      lng: address.lng,
      id: address.id + suffix,
      cep: address.cep ?? address.id,
      description: address.description,
      formattedAddress: address.description || "",
      isGeocoded: address.isGeocoded,
      displayInfo: {},
    });
  };

  addWaypoint(origin);
  addresses.forEach((address) => addWaypoint(address));

  if (returnToOrigin) {
    addWaypoint(origin, "-return");
  }

  return waypoints;
}
