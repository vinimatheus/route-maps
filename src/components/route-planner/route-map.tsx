import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExtendedLeafletMapProps } from "@/components/leaflet/map";
import type { ComponentType } from "react";

interface RouteMapProps {
  LeafletMap: ComponentType<ExtendedLeafletMapProps>;
  waypoints: ExtendedLeafletMapProps["waypoints"];
  routeKey: number;
}

export default function RouteMap({
  LeafletMap,
  waypoints,
  routeKey,
}: RouteMapProps) {
  return (
    <Card className="flex flex-col h-full w-full shadow-lg border-primary/10 transition-all duration-300 hover:shadow-xl">
      <CardHeader className="bg-background pb-2 border-b border-primary/10">
        <CardTitle className="text-xl flex items-center gap-2 text-primary/90">
          Mapa da Rota
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="h-full w-full">
          <LeafletMap
            waypoints={waypoints}
            showOrderNumbers={true}
            routeKey={routeKey}
          />
        </div>
      </CardContent>
    </Card>
  );
}
