"use client";

import { useEffect } from "react";
import type { ParsedAddress } from "@/types/import";
import { useLeafletMap } from "./LeafletMapContext";
import type L from 'leaflet';

// Declare types for the window.L global
declare global {
  interface Window {
    L: typeof L & {
      Routing: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        osrmv1: (options: any) => any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        control: (options: any) => any;
      }
    }
  }
}

interface RouteControlProps {
  waypoints: (ParsedAddress & { lat: number; lng: number })[];
  showRoute: boolean;
}

export default function RouteControl({ waypoints, showRoute }: RouteControlProps) {
  const { mapRef, routingControlRef, polylineRef } = useLeafletMap();

  useEffect(() => {
    console.log("Tentando criar rota no mapa após mudanças");

    const map = mapRef.current;
    if (!map || !window.L || !window.L.Routing) {
      console.warn("Map ou Routing não prontos.");
      return;
    }

    const timer = setTimeout(() => {
      console.log("Criando rota com atraso de 300ms...");

      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }

      if (polylineRef.current) {
        polylineRef.current.remove();
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          waypoints: routeWaypoints as any,
          router: customRouter,
          routeWhileDragging: false,
          showAlternatives: false,
          addWaypoints: false,
          fitSelectedRoutes: true,
          show: false,
          createMarker: () => null,
        }).addTo(map);

        routingControlRef.current = routingControl;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        routingControl.on("routesfound", (e: { routes: any; }) => {
          console.log("Rota encontrada:", e.routes);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        routingControl.on("routingerror", (e: { error: any; }) => {
          console.error("Erro na rota:", e.error);
          if (!polylineRef.current) {
            polylineRef.current = window.L.polyline(routeWaypoints, {
              color: "#6366F1",
              weight: 5,
              opacity: 0.7,
              dashArray: "10, 10",
            }).addTo(map);
          }
        });
      } catch (error) {
        console.error("Erro ao criar controle de rota:", error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [waypoints, showRoute, mapRef, routingControlRef, polylineRef]);

  return null;
}