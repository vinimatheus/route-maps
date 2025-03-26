"use client";

import { useState, useEffect, useCallback } from "react";
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
import type { ParsedAddress } from "@/types/import";

import LoadingOverlay from "../leaflet/LoadingOverlay";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter, SidebarInset, SidebarProvider
} from "../ui/sidebar";
import { SiteHeader } from "../site-header";
import { SectionCards } from "../section-cards";
import { LogoComponent } from "../ui/sidebar-logo";

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
  const [polylinePoints] = useState<{ lat: number; lng: number }[]>([]);
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

    const normalizedCep = originCep.replace(/\D/g, ""); // Remove caracteres não numéricos

    try {
      const location = await fetchCepData(normalizedCep);
      if (location) {
        // 🚨 Se já existir nos endereços, bloqueia a adição como origem
        if (addresses.some((addr) => addr.cep === normalizedCep)) {
          setOriginError(
            "O ponto de origem não pode ser um endereço de entrega já cadastrado."
          );
          setIsLoadingOrigin(false);
          return;
        }

        setOrigin({
          id: normalizedCep,
          cep: normalizedCep, // Mantém o CEP armazenado corretamente
          description: location.description,
          lat: location.lat,
          lng: location.lng,
          isGeocoded: true,
        });

        setOriginCep(""); // Limpa o input
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

    const normalizedCep = addressCep.replace(/\D/g, ""); // Remove caracteres não numéricos do CEP

    // 🚨 1. Bloquear CEPs duplicados
    if (addresses.some((addr) => addr.cep === normalizedCep)) {
      setAddressError("Este CEP já foi adicionado à lista.");
      return;
    }

    // 🚨 2. Bloquear se o endereço for igual ao de origem
    if (origin && origin.cep === normalizedCep) {
      setAddressError("O endereço de entrega não pode ser igual ao de origem.");
      return;
    }

    setIsLoadingAddress(true);

    try {
      const location = await fetchCepData(normalizedCep);
      if (location) {
        const newAddress: RouteAddress = {
          id: `${normalizedCep}-${Date.now()}`,
          cep: normalizedCep, // Armazena apenas o CEP numérico puro
          description: location.description,
          lat: location.lat,
          lng: location.lng,
          isGeocoded: true,
          deliveryOrder: addresses.length + 1,
          isChecked: false,
        };

        setAddresses((prev) => [...prev, newAddress]);
        setAddressCep(""); // Limpa o campo de input
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

  const calculateRoute = useCallback(
    async (forceReturn = false) => {
      if (!origin || addresses.length < 1 || isCalculatingRoute) return;

      setIsCalculatingRoute(true);

      try {
        const points = createWaypoints(origin, addresses, forceReturn);
        setWaypoints(
          points.map((p) => ({
            id: p.id,
            cep: p.cep ?? "",
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
    },
    [
      origin,
      addresses,
      isCalculatingRoute,
      setWaypoints,
      setRouteKey,
      setIsCalculatingRoute,
    ]
  );

  useEffect(() => {
    if (origin && addresses.length > 0) {
      calculateRoute();
    }
  }, [addresses, calculateRoute, origin]);

  const togglePanel = () => {
    setIsPanelExpanded(!isPanelExpanded);
  };

  const onOptimizeRoute = (optimizedAddresses: RouteAddress[]) => {
    setAddresses(optimizedAddresses);
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 120)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Sidebar collapsible="offcanvas" variant="inset">
        <SidebarFooter className="">
          <LogoComponent/>
        </SidebarFooter>
        <SidebarContent className="p-4">
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
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="p-4">
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards
                origin={origin}
                addresses={addresses}
                isVisible={!!origin && addresses.length > 0}
              />
            </div>
          </div>
        </div>
        <RouteMap
          LeafletMap={LeafletMap}
          waypoints={waypoints}
          routeKey={routeKey}
          polylinePoints={polylinePoints}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
