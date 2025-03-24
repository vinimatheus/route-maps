"use client";

import { useState } from "react";
import type { DropResult } from "@hello-pangea/dnd";
import dynamic from "next/dynamic";
import {
  type RouteAddress,
  updateDeliveryOrder,
  createWaypoints,
} from "@/lib/route-manager";
import { fetchCepData } from "@/lib/geocode-service";
import AddressPanel from "@/components/route-planner/address-panel";
import RouteMap from "@/components/route-planner/route-map";
import { cn } from "@/lib/utils";
import type { ParsedAddress } from "@/types/import";
import LoadingOverlay from "../leaflet/LoadingOverlay";

const LeafletMap = dynamic(
  async () => (await import("@/components/leaflet/map")).default,
  {
    ssr: false,
    loading: () => <LoadingOverlay />,
  }
);

export default function RoutePlannerClient() {
  const [originCep, setOriginCep] = useState("");
  const [origin, setOrigin] = useState<RouteAddress | null>(null);
  const [addressCep, setAddressCep] = useState("");
  const [addresses, setAddresses] = useState<RouteAddress[]>([]);
  const [waypoints, setWaypoints] = useState<
    (ParsedAddress & { lat: number; lng: number })[]
  >([]);
  const [routeKey, setRouteKey] = useState(0);

  const [isLoadingOrigin, setIsLoadingOrigin] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [originError, setOriginError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  const handleAddOrigin = async () => {
    if (!originCep) return;

    setOriginError(null);
    setIsLoadingOrigin(true);

    try {
      const location = await fetchCepData(originCep);
      if (location) {
        setOrigin({
          id: originCep,
          description: location.description,
          lat: location.lat,
          lng: location.lng,
          isGeocoded: true,
        });
        setOriginCep("");
      } else {
        setOriginError(
          "Não foi possível encontrar o CEP. Verifique e tente novamente."
        );
      }
    } catch (error) {
      console.error("Erro ao adicionar origem:", error);
      setOriginError("Ocorreu um erro ao buscar o CEP. Tente novamente.");
    } finally {
      setIsLoadingOrigin(false);
    }
  };

  const handleAddAddress = async () => {
    if (!addressCep) return;

    setAddressError(null);
    if (addresses.some((addr) => addr.id === addressCep)) {
      setAddressError("Este CEP já foi adicionado à lista.");
      return;
    }

    setIsLoadingAddress(true);

    try {
      const location = await fetchCepData(addressCep);
      if (location) {
        const newAddress: RouteAddress = {
          id: `${addressCep}-${Date.now()}`,
          description: location.description,
          lat: location.lat,
          lng: location.lng,
          isGeocoded: true,
          deliveryOrder: addresses.length + 1,
          isChecked: false,
        };

        setAddresses((prev) => [...prev, newAddress]);
        setAddressCep("");
      } else {
        setAddressError(
          "Não foi possível encontrar o CEP. Verifique e tente novamente."
        );
      }
    } catch (error) {
      console.error("Erro ao adicionar endereço:", error);
      setAddressError("Ocorreu um erro ao buscar o CEP. Tente novamente.");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleRemoveAddress = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = [...addresses];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = updateDeliveryOrder(items);
    setAddresses(updatedItems);
  };

  const calculateRoute = async (forceReturn = false) => {
    if (!origin || addresses.length < 1 || isCalculatingRoute) return;

    setIsCalculatingRoute(true);

    try {
      const points = createWaypoints(origin, addresses, forceReturn);
      setWaypoints(
        points.map((p) => ({
          id: p.id,
          cep: p.cep,
          isGeocoded: p.isGeocoded,
          lat: p.lat,
          lng: p.lng,
          formattedAddress: p.formattedAddress,
          displayInfo: { origem: p.description },
        }))
      );

      setRouteKey((prev) => prev + 1);

      setTimeout(() => {
        console.log("Forçando novo update no routeKey após delay.");
        setRouteKey((prev) => prev + 1);
      }, 500);
    } catch (error) {
      console.error("Erro ao calcular rota:", error);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const togglePanel = () => {
    setIsPanelExpanded(!isPanelExpanded);
  };

  const onOptimizeRoute = (optimizedAddresses: RouteAddress[]) => {
    setAddresses(optimizedAddresses);
    calculateRoute();
  };

  return (
    <div className="flex min-h-screen h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      <div className="flex flex-col lg:flex-row gap-6 flex-1 w-full p-4 md:p-6 lg:p-8">
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            isPanelExpanded ? "lg:w-1/3" : "lg:w-[120px]"
          )}
        >
          <AddressPanel
            originCep={originCep}
            setOriginCep={setOriginCep}
            origin={origin}
            originError={originError}
            isLoadingOrigin={isLoadingOrigin}
            handleAddOrigin={handleAddOrigin}
            addressCep={addressCep}
            setAddressCep={setAddressCep}
            addressError={addressError}
            isLoadingAddress={isLoadingAddress}
            handleAddAddress={handleAddAddress}
            addresses={addresses}
            handleRemoveAddress={handleRemoveAddress}
            handleDragEnd={handleDragEnd}
            calculateRoute={calculateRoute}
            isCalculatingRoute={isCalculatingRoute}
            isPanelExpanded={isPanelExpanded}
            togglePanel={togglePanel}
            setAddresses={setAddresses}
            onOptimizeRoute={onOptimizeRoute}
          />
        </div>

        <div
          className={cn(
            "flex-1 h-full transition-all duration-300",
            isPanelExpanded ? "lg:w-2/3" : "lg:w-[calc(100%-120px)]"
          )}
        >
          <RouteMap
            LeafletMap={LeafletMap}
            waypoints={waypoints}
            routeKey={routeKey}
          />
        </div>
      </div>
    </div>
  );
}
