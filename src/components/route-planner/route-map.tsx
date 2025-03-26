import type { ExtendedLeafletMapProps } from "@/components/leaflet/map";
import type { ComponentType } from "react";

interface RouteMapProps {
  LeafletMap: ComponentType<ExtendedLeafletMapProps>;
  waypoints: ExtendedLeafletMapProps["waypoints"];
  routeKey: number;
  polylinePoints: { lat: number; lng: number }[]; // ✅ adicione essa linha
}

export default function RouteMap({
  LeafletMap,
  waypoints,
  routeKey,
  polylinePoints,
}: RouteMapProps) {
  return (
    <div className="h-full w-full">
      <LeafletMap
        waypoints={waypoints}
        routeKey={routeKey}
        showOrderNumbers={true}
        polylinePoints={polylinePoints}
      />
    </div>
  );
}
