"use client";

import { createContext, useContext, useRef, useState } from "react";
import type * as L from "leaflet";

interface LeafletMapContextValue {
  mapRef: React.MutableRefObject<L.Map | null>;
  markersRef: React.MutableRefObject<L.Marker[]>;
  routingControlRef: React.MutableRefObject<L.Routing.Control | null>;
  polylineRef: React.MutableRefObject<L.Polyline | null>;
  mapReady: boolean;
  setMapReady: (ready: boolean) => void;
}

const LeafletMapContext = createContext<LeafletMapContextValue | undefined>(undefined);

export const LeafletMapProvider = ({ children }: { children: React.ReactNode }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const [mapReady, setMapReady] = useState(false);

  return (
    <LeafletMapContext.Provider
      value={{ mapRef, markersRef, routingControlRef, polylineRef, mapReady, setMapReady }}
    >
      {children}
    </LeafletMapContext.Provider>
  );
};

export function useLeafletMap() {
  const context = useContext(LeafletMapContext);
  if (!context) {
    throw new Error("useLeafletMap must be used within a LeafletMapProvider");
  }
  return context;
}
