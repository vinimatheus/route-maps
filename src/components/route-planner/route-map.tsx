import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ComponentType } from "react"

interface RouteMapProps {
  LeafletMap: ComponentType<{
    waypoints: { lat: number; lng: number }[]
    routeKey: number
    showOrderNumbers?: boolean
  }>
  waypoints: { lat: number; lng: number }[]
  routeKey: number
}

export default function RouteMap({ LeafletMap, waypoints, routeKey }: RouteMapProps) {
  return (
    <Card className="h-full shadow-lg border-primary/10 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <CardHeader className="bg-background pb-2 border-b border-primary/10">
        <CardTitle className="text-xl flex items-center gap-2 text-primary/90">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
            <path d="M2 12h20"></path>
          </svg>
          Mapa da Rota
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-60px)]">
        <div className="h-full w-full rounded-b-lg overflow-hidden transition-all duration-500">
          <LeafletMap waypoints={waypoints} routeKey={routeKey} showOrderNumbers={true} />
        </div>
      </CardContent>
    </Card>
  )
}

