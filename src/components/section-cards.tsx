"use client";

import { MapPin, Route as RouteIcon, Clock, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RouteAddress } from "@/lib/route-manager";
import { calculateTotalRouteDistance } from "@/lib/route-optimizer";

interface SectionCardsProps {
  origin: RouteAddress | null;
  addresses: RouteAddress[];
  isVisible?: boolean;
}

export function SectionCards({
  origin,
  addresses,
  isVisible = true,
}: SectionCardsProps) {
  if (!isVisible || !origin || addresses.length === 0) return null;

  const totalDistance = calculateTotalRouteDistance(origin, addresses);
  const estimatedTimeHours = totalDistance / 40;
  const hours = Math.floor(estimatedTimeHours);
  const minutes = Math.round((estimatedTimeHours - hours) * 60);
  const formattedTime =
    hours > 0 ? `${hours}h ${minutes}min` : `${minutes} minutos`;
  const averageSpeed = 40;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all bg-gradient-to-t from-indigo-50 to-white">
        <CardHeader>
          <CardDescription>Pontos de entrega</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums text-gray-800">
            {addresses.length}
          </CardTitle>
          <CardAction>
            <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md">
              <MapPin className="h-4 w-4 mr-1" />
              Paradas
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-sm text-gray-600">
          <div className="flex gap-2 items-center font-medium">
            Rota otimizada <RouteIcon className="size-4 text-indigo-500" />
          </div>
          <div className="text-gray-500">Ordem de entrega calculada</div>
        </CardFooter>
      </Card>

      <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all bg-gradient-to-t from-cyan-50 to-white">
        <CardHeader>
          <CardDescription>Distância total</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums text-gray-800">
            {totalDistance.toFixed(1)} km
          </CardTitle>
          <CardAction>
            <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md">
              <RouteIcon className="h-4 w-4 mr-1" />
              Rota
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-sm text-gray-600">
          <div className="flex gap-2 items-center font-medium">
            Distância calculada <Navigation className="size-4 text-cyan-500" />
          </div>
          <div className="text-gray-500">Baseado na ordem de entrega</div>
        </CardFooter>
      </Card>

      <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all bg-gradient-to-t from-indigo-50 to-white">
        <CardHeader>
          <CardDescription>Tempo estimado</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums text-gray-800">
            {formattedTime}
          </CardTitle>
          <CardAction>
            <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md">
              <Clock className="h-4 w-4 mr-1" />
              Duração
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-sm text-gray-600">
          <div className="flex gap-2 items-center font-medium">
            Velocidade média <Clock className="size-4 text-indigo-500" />
          </div>
          <div className="text-gray-500">Considerando trânsito normal</div>
        </CardFooter>
      </Card>

      <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all bg-gradient-to-t from-cyan-50 to-white">
        <CardHeader>
          <CardDescription>Velocidade média</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums text-gray-800">
            {averageSpeed} km/h
          </CardTitle>
          <CardAction>
            <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md">
              <Navigation className="h-4 w-4 mr-1" />
              Velocidade
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-sm text-gray-600">
          <div className="flex gap-2 items-center font-medium">
            Base usada <Navigation className="size-4 text-indigo-500" />
          </div>
          <div className="text-gray-500">Para cálculo do tempo estimado</div>
        </CardFooter>
      </Card>
    </div>
  );
}
