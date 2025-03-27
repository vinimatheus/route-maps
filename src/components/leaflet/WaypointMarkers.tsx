"use client"

import { useEffect } from "react"
import type { ParsedAddress } from "@/types/import"
import { useLeafletMap } from "./LeafletMapContext"

interface WaypointMarkersProps {
  waypoints: (ParsedAddress & { lat: number; lng: number })[]
  showOrderNumbers?: boolean
  onPinClick?: (address: ParsedAddress) => void
}

export default function WaypointMarkers({
  waypoints,
  showOrderNumbers = false,
  onPinClick,
}: WaypointMarkersProps) {
  const { mapRef, markersRef } = useLeafletMap()

  useEffect(() => {
    const map = mapRef.current
    if (!map || !window.L) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    if (waypoints.length === 0) return

    const bounds = window.L.latLngBounds([])

    waypoints.forEach((point, index) => {
      const iconHtml = `
        <div class="marker-pin">
          <span class="marker-number">${showOrderNumbers ? index + 1 : ""}</span>
        </div>
        <style>
          .marker-pin {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: black;
            color: white;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            border: 2px solid white;
          }
        </style>
      `

      const customIcon = window.L.divIcon({
        html: iconHtml,
        className: "custom-div-icon",
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      })

      const marker = window.L.marker([point.lat, point.lng], {
        icon: customIcon,
      }).addTo(map)

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 13px; line-height: 1.5; max-width: 250px;">
          <div>
            <strong>Endereço:</strong> ${point.formattedAddress ?? "Não informado"}<br/>
            <strong>CEP:</strong> ${point.cep}<br/>
            <strong>Latitude:</strong> ${point.lat}<br/>
            <strong>Longitude:</strong> ${point.lng}
          </div>
          <button onclick="navigator.clipboard.writeText('Endereço: ${point.formattedAddress ?? "Não informado"} | CEP: ${point.cep} | Lat: ${point.lat} | Lng: ${point.lng}'); this.innerText = 'Copiado!'; setTimeout(() => this.innerText = 'Copiar endereço', 2000);"
            style="margin-top: 8px; background: black; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
            Copiar endereço
          </button>
        </div>
      `

      marker.bindPopup(popupContent)

      marker.on("click", () => {
        marker.openPopup()
        if (onPinClick) {
          onPinClick(point)
        }
      })

      markersRef.current.push(marker)
      bounds.extend([point.lat, point.lng])
    })

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [waypoints, showOrderNumbers, onPinClick, mapRef, markersRef])

  return null
}
