"use client";

import { type LeafletMapProps, ParsedAddress } from "@/types/import";
import { useMapResourcesLoader } from "./useMapResourcesLoader";
import LoadingOverlay from "./LoadingOverlay";
import MapContainer from "./MapContainer";
import WaypointMarkers from "./WaypointMarkers";
import RouteControl from "./RouteControl";
import { LeafletMapProvider, useLeafletMap } from "./LeafletMapContext";

export type ExtendedLeafletMapProps = LeafletMapProps & {
  onPinClick?: (address: ParsedAddress) => void;
  showOrderNumbers: boolean;
  polylinePoints: { lat: number; lng: number }[]; 
};




export default function LeafletMap({
  waypoints,
  showOrderNumbers,
  onPinClick,
  routeKey,
}: ExtendedLeafletMapProps) {
  const isMapReady = useMapResourcesLoader();

  return (
    <div key={routeKey} className="relative h-full w-full">
      {isMapReady ? (
        <LeafletMapProvider>
          <MapContainer />
          <DelayedMapChildren
            key={routeKey}
            waypoints={waypoints}
            showOrderNumbers={showOrderNumbers}
            onPinClick={onPinClick}
          />
        </LeafletMapProvider>
      ) : (
        <LoadingOverlay />
      )}
    </div>
  );
}

function DelayedMapChildren({
  waypoints,
  showOrderNumbers,
  onPinClick,
}: {
  waypoints: (ParsedAddress & { lat: number; lng: number })[];
  showOrderNumbers: boolean;
  onPinClick?: (address: ParsedAddress) => void;
}) {
  const { mapReady } = useLeafletMap();

  if (!mapReady) {
    return null;
  }

  return (
    <>
      <WaypointMarkers
        waypoints={waypoints}
        showOrderNumbers={showOrderNumbers}
        onPinClick={onPinClick}
      />
      <RouteControl waypoints={waypoints} showRoute={showOrderNumbers} />
    </>
  );
}
