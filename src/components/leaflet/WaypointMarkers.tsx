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

    // Remove marcadores antigos
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (waypoints.length === 0) return;

    const bounds = window.L.latLngBounds([]);

    waypoints.forEach((point, index) => {
      const markerType =
        index === 0
          ? "origin"
          : index === waypoints.length - 1 &&
            point.lat === waypoints[0].lat &&
            point.lng === waypoints[0].lng
          ? "return"
          : "destination";

      const iconHtml = `
        <div class="marker-pin marker-pin-${markerType}">
          <span class="marker-number">${
            showOrderNumbers ? index + 1 : ""
          }</span>
        </div>
        <style>
          .marker-pin {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            box-shadow: 0 0 4px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 12px;
            color: white;
            border: 2px solid white;
          }
          .marker-pin-origin {
            background: radial-gradient(circle, #6366f1 0%, #22d3ee 100%);
            animation: pulse-origin 1.5s infinite;
          }
          .marker-pin-destination {
            background: linear-gradient(135deg, #22d3ee, #6366f1);
          }
          .marker-pin-return {
            background: linear-gradient(135deg, #f97316, #fb923c);
            animation: pulse-return 1.5s infinite;
          }
          @keyframes pulse-origin {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes pulse-return {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          .marker-number {
            position: relative;
          }
        </style>
      `;

      const customIcon = window.L.divIcon({
        html: iconHtml,
        className: "custom-div-icon",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });

      const marker = window.L.marker([point.lat, point.lng], {
        icon: customIcon,
      }).addTo(map);

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; font-size: 13px; line-height: 1.5; padding: 8px; max-width: 250px;">
          <div style="margin-bottom: 8px;">
            <strong>Endereço:</strong> ${point.formattedAddress ?? "Não informado"}<br/>
            <strong>CEP:</strong> ${point.cep}<br/>
            <strong>Latitude:</strong> ${point.lat}<br/>
            <strong>Longitude:</strong> ${point.lng}
          </div>
          <button onclick="navigator.clipboard.writeText('Endereço: ${point.formattedAddress ?? "Não informado"} | CEP: ${point.cep} | Lat: ${point.lat} | Lng: ${point.lng}'); this.innerText = 'Copiado!'; setTimeout(() => this.innerText = 'Copiar endereço', 2000);" 
            style="background: linear-gradient(135deg, #6366f1, #22d3ee); color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; transition: opacity 0.2s;">
            Copiar endereço
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("click", () => {
        marker.openPopup();
        if (onPinClick) {
          onPinClick(point);
        }
      });

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
