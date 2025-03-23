import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

  // Calcula a distância total da rota
  const totalDistance = calculateTotalRouteDistance(origin, addresses)

  // Estima o tempo de viagem (assumindo velocidade média de 40 km/h)
  const estimatedTimeHours = totalDistance / 40

  // Converte para horas e minutos
  const hours = Math.floor(estimatedTimeHours)
  const minutes = Math.round((estimatedTimeHours - hours) * 60)

  // Formata o tempo estimado
  const formattedTime = hours > 0 ? `${hours}h ${minutes}min` : `${minutes} minutos`

  return (
    <Card className="shadow-md border-primary/10 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="bg-background pb-2 border-b border-primary/10">
        <CardTitle className="text-lg flex items-center gap-2 text-primary/90">
          <Route className="h-5 w-5 text-primary" />
          <span>Estatísticas da Rota</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pontos de entrega</p>
              <p className="text-xl font-semibold">{addresses.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Distância total</p>
              <p className="text-xl font-semibold">{totalDistance.toFixed(1)} km</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo estimado</p>
              <p className="text-xl font-semibold">{formattedTime}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-primary/10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Ordem de entrega otimizada</p>
            <Badge variant="outline" className="bg-primary/5">
              {addresses.length} paradas
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

