"use client";

import { useEffect } from "react";
import { useLeafletMap } from "./LeafletMapContext";

export default function MapContainer() {
  const { mapRef, setMapReady } = useLeafletMap();

  useEffect(() => {
    if (mapRef.current || !window.L) return;
  
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
  
    setTimeout(() => {
      map.invalidateSize();
    }, 500);
  }, [mapRef, setMapReady]);
  

  // ✅ Aqui você adiciona o efeito para atualizar o tamanho sempre que waypoints mudarem:
  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 500);
    }
  }, [mapRef]);

  return <div id="map" className="h-full w-full" />;
}
