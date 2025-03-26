"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Route, Clock } from "lucide-react";
import type { RouteAddress } from "@/lib/route-manager";
import { calculateTotalRouteDistance } from "@/lib/route-optimizer";

interface RouteStatsProps {
  origin: RouteAddress | null;
  addresses: RouteAddress[];
  isVisible: boolean;
}

export function RouteStats({ origin, addresses, isVisible }: RouteStatsProps) {
  if (!isVisible || !origin || addresses.length === 0) return null;

  const totalDistance = calculateTotalRouteDistance(origin, addresses);
  const estimatedTimeHours = totalDistance / 40;
  const hours = Math.floor(estimatedTimeHours);
  const minutes = Math.round((estimatedTimeHours - hours) * 60);
  const formattedTime =
    hours > 0 ? `${hours}h ${minutes}min` : `${minutes} minutos`;

  return (
    <Card className="shadow-md border border-slate-200 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50 pb-4 border-b border-slate-200 rounded-t-3xl">
        <CardTitle className="text-lg flex items-center gap-3 text-gray-700 font-semibold">
          <Route className="h-5 w-5 text-indigo-500" />
          Estatísticas da rota
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-wider">
                Pontos de entrega
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {addresses.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center">
              <Route className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-wider">
                Distância total
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {totalDistance.toFixed(1)} km
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-wider">
                Tempo estimado
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {formattedTime}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Ordem de entrega otimizada
            </p>
            <Badge
              variant="outline"
              className="bg-indigo-50 text-indigo-600 border-indigo-200 rounded-lg text-xs font-semibold"
            >
              {addresses.length} paradas
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
