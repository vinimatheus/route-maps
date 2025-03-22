"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

interface MapProps {
  waypoints?: { lat: number; lng: number }[];
  routeKey?: number;
  showOrderNumbers?: boolean;
}

export default function LeafletMap({ waypoints = [], routeKey = 0 }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  // Definindo uma interface para o controle de roteamento
  interface RoutingControl extends L.Control {
    on(event: string, handler: (e: RoutingErrorEvent | RoutesFoundEvent) => void): this;
    getPlan(): L.Routing.Plan;
    getRouter(): L.Routing.IRouter;
    route(): this;
  }
  
  // Definindo interfaces para os eventos de roteamento
  interface RoutingErrorEvent {
    error: Error;
  }
  
  interface RoutesFoundEvent {
    routes: L.Routing.IRoute[];
  }
  const routingControlRef = useRef<RoutingControl | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      // Fix Leaflet icon issues
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current, {
        center: [-23.5505, -46.6333], // São Paulo
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Force a resize to ensure the map renders correctly
      setTimeout(() => {
        map.invalidateSize();
      }, 250);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers and routes when waypoints or routeKey changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const map = mapInstanceRef.current;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Remove existing routing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    
    // Remove existing polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
    
    // Add markers for waypoints
    if (waypoints && waypoints.length > 0) {
      const bounds = L.latLngBounds([]);
      
      waypoints.forEach((point, index) => {
        // Create custom marker icon based on index
        let markerType = 'destination';
        if (index === 0) {
          markerType = 'origin';
        } else if (index === waypoints.length - 1 && index !== 0 && waypoints[0].lat === point.lat && waypoints[0].lng === point.lng) {
          markerType = 'return';
        }
        
        // Create custom HTML icon
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="marker-pin marker-pin-${markerType}">
              <span class="marker-number">${index + 1}</span>
            </div>`,
          iconSize: [30, 42],
          iconAnchor: [15, 42],
          popupAnchor: [0, -42]
        });
        
        const marker = L.marker([point.lat, point.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`<div class="custom-popup"><b>Ponto ${index + 1}</b><br/>${markerType === 'origin' ? 'Origem' : markerType === 'return' ? 'Retorno' : 'Destino'}</div>`);
        
        // Add entrance animation
        const markerElement = marker.getElement();
        if (markerElement) {
          markerElement.style.opacity = '0';
          markerElement.style.transform = 'translateY(-10px)';
          markerElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          
          setTimeout(() => {
            markerElement.style.opacity = '1';
            markerElement.style.transform = 'translateY(0)';
          }, 100 * index);
        }
        
        markersRef.current.push(marker);
        bounds.extend([point.lat, point.lng]);
      });
      
      // Fit map to show all markers
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
      
      // Create route if we have at least 2 waypoints
      if (waypoints.length >= 2) {
        console.log("Creating route with waypoints:", waypoints);
        
        try {
          // Create route waypoints
          const routeWaypoints = waypoints.map(point => 
            L.latLng(point.lat, point.lng)
          );
          
          // Definir um roteador personalizado que usa a API do GraphHopper
          const customRouter = L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'car',
            timeout: 30 * 1000, // 30 segundos de timeout
            geometryOnly: false
          });
          
          // Criar o controle de roteamento com o roteador personalizado
          const routingControl = L.Routing.control({
            waypoints: routeWaypoints,
            router: customRouter,
            routeWhileDragging: false,
            showAlternatives: false,
            addWaypoints: false,
            fitSelectedRoutes: true,
            show: false, // Não mostrar o painel de instruções
            lineOptions: {
              styles: [
                { color: '#6366F1', weight: 6, opacity: 0.8 },
                { color: '#818CF8', weight: 3, opacity: 0.6 },
                { color: '#ffffff', weight: 1, opacity: 0.3 }
              ],
              extendToWaypoints: true,
              missingRouteTolerance: 0
            },
            createMarker: function() { return null; } // Não criar marcadores padrão
          }).addTo(map) as RoutingControl;
          
          routingControlRef.current = routingControl;
          
          // Adicionar listener para erros de roteamento
          routingControlRef.current.on('routingerror', function(e) {
            console.error('Routing error:', e);
            
            // Se o roteamento falhar, criar uma linha reta como fallback
            if (!polylineRef.current) {
              polylineRef.current = L.polyline(
                routeWaypoints,
                { color: '#6366F1', weight: 5, opacity: 0.7, dashArray: '10, 10' }
              ).addTo(map);
            }
          });
          
          // Adicionar listener para quando a rota for encontrada
          routingControlRef.current.on('routesfound', function(e) {
            console.log('Routes found:', e);
          });
        } catch (error) {
          console.error("Error creating route:", error);
          
          // Em caso de erro, criar uma linha reta como fallback
          polylineRef.current = L.polyline(
            waypoints.map(point => [point.lat, point.lng]),
            { color: '#6366F1', weight: 5, opacity: 0.7, dashArray: '10, 10' }
          ).addTo(map);
        }
      }
    }
  }, [waypoints, routeKey]);

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full rounded-md"
      style={{ minHeight: "500px" }}
    />
  );
}
