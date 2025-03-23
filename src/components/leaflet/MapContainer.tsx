"use client";

import { useEffect } from "react";
import { useLeafletMap } from "./LeafletMapContext";

export default function MapContainer() {
  const { mapRef, setMapReady } = useLeafletMap();

  useEffect(() => {
    if (mapRef.current) return;

    if (window.L) {
      console.log("Criando mapa Leaflet...");
      const map = window.L.map("map", {
        center: [-23.55052, -46.633308],
        zoom: 12,
      });

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
      console.log("Mapa criado com sucesso e salvo em mapRef");
    }
  }, [mapRef, setMapReady]);

  return <div id="map" className="h-full w-full rounded-b-lg overflow-hidden" />;
}
