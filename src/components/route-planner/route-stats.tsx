"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Route, Clock } from "lucide-react"
import type { RouteAddress } from "@/lib/route-manager"
import { calculateTotalRouteDistance } from "@/lib/route-optimizer"

interface RouteStatsProps {
  origin: RouteAddress | null
  addresses: RouteAddress[]
  isVisible: boolean
}

export function RouteStats({ origin, addresses, isVisible }: RouteStatsProps) {
  if (!isVisible || !origin || addresses.length === 0) return null

  const totalDistance = calculateTotalRouteDistance(origin, addresses)
  const estimatedTimeHours = totalDistance / 40
  const hours = Math.floor(estimatedTimeHours)
  const minutes = Math.round((estimatedTimeHours - hours) * 60)
  const formattedTime =
    hours > 0 ? `${hours}h ${minutes}min` : `${minutes} minutos`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Route className="h-5 w-5" />
          Estatísticas da rota
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border flex items-center justify-center">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase">Pontos de entrega</p>
              <p className="text-xl font-semibold">{addresses.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border flex items-center justify-center">
              <Route className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase">Distância total</p>
              <p className="text-xl font-semibold">
                {totalDistance.toFixed(1)} km
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase">Tempo estimado</p>
              <p className="text-xl font-semibold">{formattedTime}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm">Ordem de entrega otimizada</p>
            <Badge variant="outline" className="text-xs">
              {addresses.length} paradas
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
