"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, RotateCw, CheckCircle2 } from "lucide-react";
import type { RouteAddress } from "@/lib/route-manager";
import {
  optimizeRouteNearestNeighbor,
  calculateTotalRouteDistance,
} from "@/lib/route-optimizer";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [optimizationStats, setOptimizationStats] = useState<{
    originalDistance: number;
    optimizedDistance: number;
    savingsPercent: number;
  } | null>(null);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleOptimizeRoute = async () => {
    if (!origin || addresses.length < 2 || isOptimizing) return;

    setIsOptimizing(true);

    try {
      await delay(800); // simula carregamento

      const originalDistance = calculateTotalRouteDistance(origin, addresses);
      const optimizedAddresses = optimizeRouteNearestNeighbor(origin, addresses);
      const optimizedDistance = calculateTotalRouteDistance(origin, optimizedAddresses);

      const savingsPercent =
        ((originalDistance - optimizedDistance) / originalDistance) * 100;

      setOptimizationStats({
        originalDistance,
        optimizedDistance,
        savingsPercent,
      });

      console.log("Otimização concluída:", {
        originalDistance,
        optimizedDistance,
        savingsPercent,
      });

      setShowConfirmDialog(true);
    } catch (error) {
      console.error("Erro ao otimizar rota:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const confirmOptimization = () => {
    if (!origin || addresses.length < 2) return;

    const optimizedAddresses = optimizeRouteNearestNeighbor(origin, addresses);
    onOptimizeRoute(optimizedAddresses);
    setShowConfirmDialog(false);
    setOptimizationStats(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-primary/20 hover:bg-primary/5"
            disabled={disabled || !origin || addresses.length < 2 || isOptimizing}
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Otimizando...</span>
              </>
            ) : (
              <>
                <RotateCw className="h-4 w-4" />
                <span>Otimizar Rota</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem onClick={handleOptimizeRoute}>
            <MapPin className="mr-2 h-4 w-4" />
            <span>Otimizar por proximidade</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Otimização de Rota</DialogTitle>
            <DialogDescription>
              A rota foi otimizada para minimizar a distância total percorrida.
            </DialogDescription>
          </DialogHeader>

          {optimizationStats && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Rota Original
                  </p>
                  <p className="text-2xl font-bold">
                    {optimizationStats.originalDistance.toFixed(1)} km
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Rota Otimizada
                  </p>
                  <p className="text-2xl font-bold">
                    {optimizationStats.optimizedDistance.toFixed(1)} km
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 px-3 py-1"
                >
                  Economia de {optimizationStats.savingsPercent.toFixed(1)}%
                </Badge>
              </div>

              <p className="text-sm text-center text-muted-foreground">
                A ordem de entrega será reordenada para seguir o caminho mais
                eficiente.
              </p>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmOptimization}>Aplicar Otimização</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
