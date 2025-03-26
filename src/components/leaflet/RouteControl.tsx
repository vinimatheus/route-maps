"use client";

import { useEffect } from "react";
import type { ParsedAddress } from "@/types/import";
import { useLeafletMap } from "./LeafletMapContext";
import type L from "leaflet";

interface RouteControlProps {
  waypoints: (ParsedAddress & { lat: number; lng: number })[];
  showRoute: boolean;
}

export default function RouteControl({ waypoints, showRoute }: RouteControlProps) {
  const { mapRef, routingControlRef, polylineRef, mapReady } = useLeafletMap();

  useEffect(() => {
    if (!mapReady) {
      console.log("Map ainda não pronto, aguardando...");
      return;
    }

    const map = mapRef.current;
    if (!map || !window.L || !window.L.Routing) {
      console.warn("Map ou Routing não disponíveis.");
      return;
    }

    console.log("Criando rota no mapa...");

    if (routingControlRef.current && map) {
      try {
        map.removeControl(routingControlRef.current);
      } catch (error) {
        console.warn("Erro ao remover controle de rota:", error);
      }
      routingControlRef.current = null;
    }

    if (polylineRef.current) {
      try {
        polylineRef.current.remove();
      } catch (error) {
        console.warn("Erro ao remover polyline:", error);
      }
      polylineRef.current = null;
    }

    const routeWaypoints = waypoints.map((p) => window.L.latLng(p.lat, p.lng));

    try {
      const customRouter = window.L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "car",
        timeout: 30000,
      }) as unknown as L.Routing.IRouter;

      const routingControl = window.L.Routing.control({
        waypoints: routeWaypoints,
        router: customRouter,
        routeWhileDragging: false,
        showAlternatives: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
        createMarker: () => null,
      }).addTo(map);

      routingControlRef.current = routingControl as unknown as L.Routing.Control;

      routingControl.on("routesfound", (e: L.Routing.RoutingEvent) => {
        const event = e as unknown as L.Routing.RoutingResultEvent;
        console.log("Rota encontrada:", event.routes);
      });

      routingControl.on("routingerror", (e: L.Routing.RoutingEvent) => {
        const event = e as unknown as L.Routing.RoutingErrorEvent;
        console.error("Erro na rota:", event.error);
        console.info("Criando polyline fallback para visualização da rota.");

        if (polylineRef.current) {
          polylineRef.current.remove();
          polylineRef.current = null;
        }

        const fallbackPolyline = window.L.polyline(routeWaypoints, {
          color: "#6366F1",
          weight: 5,
          opacity: 0.7,
          dashArray: "10, 10",
        }).addTo(map);

        fallbackPolyline.bringToFront();

        polylineRef.current = fallbackPolyline;
      });
    } catch (error) {
      console.error("Erro ao criar controle de rota:", error);
    }
  }, [mapReady, waypoints, showRoute, mapRef, routingControlRef, polylineRef]);

  return null;
}
