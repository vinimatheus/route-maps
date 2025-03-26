"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCw } from "lucide-react";
import type { RouteAddress } from "@/lib/route-manager";
import { optimizeRouteNearestNeighbor } from "@/lib/route-optimizer";

interface RouteOptimizerButtonProps {
  origin: RouteAddress | null;
  addresses: RouteAddress[];
  onOptimizeRoute: (optimizedAddresses: RouteAddress[]) => void;
  disabled?: boolean;
}

export function RouteOptimizerButton({
  origin,
  addresses,
  onOptimizeRoute,
  disabled = false,
}: RouteOptimizerButtonProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleOptimizeRoute = async () => {
    if (!origin || addresses.length < 2 || isOptimizing) return;

    setIsOptimizing(true);

    try {
      await delay(500); // Simula carregamento leve
      const optimizedAddresses = optimizeRouteNearestNeighbor(
        origin,
        addresses
      );
      onOptimizeRoute(optimizedAddresses);
    } catch (error) {
      console.error("Erro ao otimizar rota:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <Button
      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-400 text-white rounded-2xl shadow-md hover:from-indigo-600 hover:to-cyan-500 hover:scale-105 hover:shadow-xl transition-all disabled:opacity-60 disabled:pointer-events-none"
      disabled={disabled || !origin || addresses.length < 2 || isOptimizing}
      onClick={handleOptimizeRoute}
    >
      {isOptimizing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Otimizando...</span>
        </>
      ) : (
        <>
          <RotateCw className="h-4 w-4" />
          <span className="text-sm font-medium">Otimizar rota</span>
        </>
      )}
    </Button>
  );
}
