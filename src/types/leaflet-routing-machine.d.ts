/**
 * Type definitions for Leaflet Routing Machine
 * These definitions extend the Leaflet namespace to include Routing Machine functionality
 */

import L from 'leaflet';

declare module 'leaflet' {
  namespace Routing {
    interface RoutingControlOptions {
      waypoints?: L.LatLng[];
      router?: IRouter;
      routeWhileDragging?: boolean;
      showAlternatives?: boolean;
      addWaypoints?: boolean;
      fitSelectedRoutes?: boolean;
      show?: boolean;
      lineOptions?: RoutingLineOptions;
      createMarker?: (i: number, waypoint: L.LatLng, n: number) => L.Marker | null;
    }

    interface RoutingLineOptions {
      styles?: L.PathOptions[];
      extendToWaypoints?: boolean;
      missingRouteTolerance?: number;
    }

    interface IRouter {
      route(waypoints: L.LatLng[], callback: (error: Error | null, routes: IRoute[]) => void): void;
    }

    interface IRoute {
      name: string;
      coordinates: L.LatLng[];
      summary: IRouteSummary;
      waypoints: L.LatLng[];
      instructions: IInstruction[];
    }

    interface IRouteSummary {
      totalDistance: number;
      totalTime: number;
    }

    interface IInstruction {
      type: string;
      distance: number;
      time: number;
      road?: string;
      direction?: string;
      index?: number;
      text: string;
    }

    interface Plan extends L.Layer {
      getWaypoints(): L.LatLng[];
      setWaypoints(waypoints: L.LatLng[]): Plan;
      spliceWaypoints(index: number, waypointsToRemove: number, ...waypoints: L.LatLng[]): Plan;
    }

    interface OSRMv1Options {
      serviceUrl: string;
      profile?: string;
      timeout?: number;
      geometryOnly?: boolean;
    }

    interface RoutingErrorEvent {
      error: Error;
    }

    interface RoutesFoundEvent {
      routes: IRoute[];
    }

    type RoutingEvent = RoutingErrorEvent | RoutesFoundEvent;

    function control(options?: RoutingControlOptions): L.Control & {
      on(event: string, handler: (e: RoutingEvent) => void): L.Control;
      getPlan(): Plan;
      getRouter(): IRouter;
      route(): L.Control;
    };

    function osrmv1(options?: OSRMv1Options): IRouter;
  }
}

// Declare the module to make TypeScript recognize the import
declare module 'leaflet-routing-machine' {}
declare module 'leaflet-routing-machine/dist/leaflet-routing-machine.css' {}