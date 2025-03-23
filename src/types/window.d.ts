import type { Map, Marker, Polyline } from "leaflet"
import type { Control } from "leaflet-routing-machine"

declare global {
  interface Window {
    L: typeof import("leaflet") & {
      Routing: typeof import("leaflet-routing-machine")
    }
    leafletMap: Map | null
    leafletMarkers: Marker[]
    leafletRoutingControl: Control | null
    leafletPolyline: Polyline | null
  }
}