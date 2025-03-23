"use client";

import { useEffect } from "react";
import { useLeafletMap } from "./LeafletMapContext";

export default function MapContainer() {
  const { mapRef, setMapReady } = useLeafletMap();

  useEffect(() => {
    if (mapRef.current) return;

    if (window.L) {
      console.log("Criando mapa Leaflet...");
      const map = window.L.map("map-id").setView([-23.55052, -46.633308], 12);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      mapRef.current = map;
      console.log("Mapa criado e salvo em mapRef");
      setMapReady(true);
    }
  }, []);

  return <div id="map-id" className="h-full w-full" />;
}
