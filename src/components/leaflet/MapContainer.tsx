"use client";

import { useEffect } from "react";
import { useLeafletMap } from "@/components/leaflet/LeafletMapContext";
import { useSidebar } from "@/components/ui/sidebar";

export default function MapContainer() {
  const { mapRef, setMapReady } = useLeafletMap();
  const { state } = useSidebar(); // ✅ ouvir o sidebar expand/collapse

  useEffect(() => {
    if (mapRef.current || !window.L) return;

    const map = window.L.map("map", {
      center: [-23.55052, -46.633308],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;
    setMapReady(true);

    setTimeout(() => map.invalidateSize(), 500);
  }, [mapRef, setMapReady]);

  // ✅ Sempre que o sidebar for expandido ou minimizado
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current!.invalidateSize();
      }, 350); // espera animação do sidebar
    }
  }, [state]);

  return <div id="map" className="h-full w-full" />;
}
