"use client"

import { ComponentType, useState } from "react"
import { DropResult } from "@hello-pangea/dnd"
import dynamic from "next/dynamic"
import { RouteAddress, updateDeliveryOrder, createWaypoints } from "@/lib/route-manager"
import { fetchCepData } from "@/lib/geocode-service"
import AddressPanel from "@/components/route-planner/address-panel"
import RouteMap from "@/components/route-planner/route-map"
import { cn } from "@/lib/utils"

// Dynamically import the map component to avoid SSR issues
const LeafletMap = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted/30 rounded-xl">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="text-muted-foreground">Carregando mapa...</p>
      </div>
    </div>
  ),
})

export default function RoutePlannerClient() {
  const [originCep, setOriginCep] = useState("")
  const [origin, setOrigin] = useState<RouteAddress | null>(null)
  const [addressCep, setAddressCep] = useState("")
  const [addresses, setAddresses] = useState<RouteAddress[]>([])
  const [waypoints, setWaypoints] = useState<{ lat: number; lng: number }[]>([])
  const [routeKey, setRouteKey] = useState(0)

  
  // Loading states
  const [isLoadingOrigin, setIsLoadingOrigin] = useState(false)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false)
  
  // Error states
  const [originError, setOriginError] = useState<string | null>(null)
  const [addressError, setAddressError] = useState<string | null>(null)
  
  // Animation states
  const [isPanelExpanded, setIsPanelExpanded] = useState(true)

  const handleAddOrigin = async () => {
    if (!originCep) return
    
    // Reset error state
    setOriginError(null)
    
    // Set loading state
    setIsLoadingOrigin(true)
    
    try {
      const location = await fetchCepData(originCep)
      if (location) {
        setOrigin({
          id: originCep,
          description: location.description,
          lat: location.lat,
          lng: location.lng,
          isGeocoded: true,
        })
        setOriginCep("")
      } else {
        setOriginError("Não foi possível encontrar o CEP. Verifique e tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao adicionar origem:", error)
      setOriginError("Ocorreu um erro ao buscar o CEP. Tente novamente.")
    } finally {
      setIsLoadingOrigin(false)
    }
  }

  const handleAddAddress = async () => {
    if (!addressCep) return
    
    // Reset error state
    setAddressError(null)
    
    // Check if address already exists
    const addressExists = addresses.some(addr => addr.id === addressCep)
    if (addressExists) {
      setAddressError("Este CEP já foi adicionado à lista.")
      return
    }
    
    // Set loading state
    setIsLoadingAddress(true)
    
    try {
      const location = await fetchCepData(addressCep)
      if (location) {
        // Create a unique ID by combining CEP with timestamp to avoid duplicate keys
        const uniqueId = `${addressCep}-${Date.now()}`
        
        const newAddress: RouteAddress = {
          id: uniqueId,
          description: location.description,
          lat: location.lat,
          lng: location.lng,
          isGeocoded: true,
          deliveryOrder: addresses.length + 1,
          isChecked: false
        }
        
        setAddresses((prev) => [...prev, newAddress])
        setAddressCep("")
      } else {
        setAddressError("Não foi possível encontrar o CEP. Verifique e tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao adicionar endereço:", error)
      setAddressError("Ocorreu um erro ao buscar o CEP. Tente novamente.")
    } finally {
      setIsLoadingAddress(false)
    }
  }

  const handleRemoveAddress = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id))
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = [...addresses]
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    // Atualiza a ordem de entrega após o arrastar e soltar
    const updatedItems = updateDeliveryOrder(items)
    setAddresses(updatedItems)
  }

  
  
  // Calcula a rota com base nos endereços e na opção de retorno
  const calculateRoute = async (forceReturn = false) => {
    if (!origin || addresses.length < 1 || isCalculatingRoute) return
    
    // Set loading state to prevent multiple clicks
    setIsCalculatingRoute(true)
    
    try {
      // Usa a função do route-manager para criar os waypoints
      // Só inclui o retorno se forceReturn for true ou se returnToOrigin estiver ativado
      const shouldReturn = forceReturn 
      const points = createWaypoints(origin, addresses, shouldReturn)
      
      // Simulating a small delay to prevent UI flashing
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setWaypoints(points)
      setRouteKey((prev) => prev + 1)
    } catch (error) {
      console.error("Erro ao calcular rota:", error)
    } finally {
      setIsCalculatingRoute(false)
    }
  }

  const togglePanel = () => {
    setIsPanelExpanded(!isPanelExpanded)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
        <header className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-2">Planejador de Rotas</h1>
          <p className="text-muted-foreground text-lg">Organize suas entregas de forma eficiente e elegante</p>
          <div className="h-1 w-32 bg-gradient-to-r from-primary to-transparent rounded-full mt-3"></div>
        </header>
        
        <div className="flex flex-col lg:flex-row gap-6 flex-1">
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
            />
          </div>
          
          <div className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            isPanelExpanded ? "lg:w-2/3" : "lg:w-[calc(100%-120px)]"
          )}>
            <div className="flex-1">
              <RouteMap 
                LeafletMap={LeafletMap as ComponentType<{
                  waypoints: { lat: number; lng: number }[];
                  routeKey: number;
                  showOrderNumbers?: boolean;
                }>}
                waypoints={waypoints}
                routeKey={routeKey}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
