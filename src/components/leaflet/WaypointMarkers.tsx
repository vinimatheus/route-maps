"use client";

import { useEffect } from "react";
import type { ParsedAddress } from "@/types/import";
import { useLeafletMap } from "./LeafletMapContext";

interface WaypointMarkersProps {
  waypoints: (ParsedAddress & { lat: number; lng: number })[];
  showOrderNumbers?: boolean;
  onPinClick?: (address: ParsedAddress) => void;
}

export default function WaypointMarkers({
  waypoints,
  showOrderNumbers = false,
  onPinClick,
}: WaypointMarkersProps) {
  const { mapRef, markersRef } = useLeafletMap();

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.L) return;

    // Limpa markers anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (waypoints.length === 0) return;

    const bounds = window.L.latLngBounds([]);

    waypoints.forEach((point, index) => {
      const markerType =
        index === 0 && showOrderNumbers
          ? "origin"
          : index === waypoints.length - 1 &&
            index !== 0 &&
            showOrderNumbers &&
            waypoints[0].lat === point.lat &&
            waypoints[0].lng === point.lng
          ? "return"
          : "destination";

      const customIcon = window.L.divIcon({
        className: "custom-div-icon",
        html: `
          <div style="background-color: ${
            markerType === "origin"
              ? "#10b981"
              : markerType === "return"
              ? "#f59e0b"
              : "#6366f1"
          }; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">
            ${
              showOrderNumbers
                ? index + 1
                : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>'
            }
          </div>`,
      });

      const marker = window.L.marker([point.lat, point.lng], {
        icon: customIcon,
      }).addTo(map);

      if (onPinClick) {
        marker.on("click", () => {
          onPinClick(point);
        });
      }

      markersRef.current.push(marker);
      bounds.extend([point.lat, point.lng]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [waypoints, showOrderNumbers, onPinClick, mapRef, markersRef]);

  return null;
}
