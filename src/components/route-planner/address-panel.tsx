import type React from "react"

import { useState } from "react"
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Trash2,
  MapPin,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Navigation,
} from "lucide-react"
import type { RouteAddress } from "@/lib/route-manager"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
// Importação do dialog removida
import { RouteOptimizerButton } from "./route-optimizer-button"
import { RouteStats } from "./route-stats"

interface AddressPanelProps {
  originCep: string
  setOriginCep: React.Dispatch<React.SetStateAction<string>>
  origin: RouteAddress | null
  originError: string | null
  isLoadingOrigin: boolean
  handleAddOrigin: () => void
  addressCep: string
  setAddressCep: React.Dispatch<React.SetStateAction<string>>
  addressError: string | null
  isLoadingAddress: boolean
  handleAddAddress: () => void
  addresses: RouteAddress[]
  handleRemoveAddress: (id: string) => void
  handleDragEnd: (result: DropResult) => void
  calculateRoute: (forceReturn?: boolean) => void
  isCalculatingRoute: boolean
  isPanelExpanded: boolean
  togglePanel: () => void
  setAddresses: React.Dispatch<React.SetStateAction<RouteAddress[]>>
  onOptimizeRoute: (optimizedAddresses: RouteAddress[]) => void
}

export default function AddressPanel({
  originCep,
  setOriginCep,
  origin,
  originError,
  isLoadingOrigin,
  handleAddOrigin,
  addressCep,
  setAddressCep,
  addressError,
  isLoadingAddress,
  handleAddAddress,
  addresses,
  handleRemoveAddress,
  handleDragEnd,
  calculateRoute,
  isCalculatingRoute,
  isPanelExpanded,
  togglePanel,
  onOptimizeRoute,
}: AddressPanelProps) {
  const [, setOriginError] = useState<string | null>(originError)
  const [, setAddressError] = useState<string | null>(addressError)

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === "Enter") {
      handler()
    }
  }

  if (!isPanelExpanded) {
    return (
      <div className="h-full">
        <Button
          variant="outline"
          size="icon"
          className="fixed z-10 left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full shadow-md bg-background text-primary border border-primary/20 hover:bg-primary/5 hover:shadow-lg transition-all duration-300 hover:scale-105"
          onClick={togglePanel}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  return (
    <Card className="h-full shadow-lg border-primary/10 overflow-hidden relative transition-all duration-300 hover:shadow-xl">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 lg:flex hidden z-10 opacity-70 hover:opacity-100 hover:bg-primary/10 transition-all duration-200"
        onClick={togglePanel}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <CardHeader className="bg-background pb-2 border-b border-primary/10">
        <CardTitle className="text-xl flex items-center gap-2 text-primary/90">
          <Navigation className="h-5 w-5 text-primary" />
          <span className="font-bold">Planejar Rotas</span>
        </CardTitle>
      </CardHeader>

      <div className="flex flex-col h-[calc(100%-60px)]">
        <CardContent className="pt-4 flex flex-col gap-6 h-full overflow-auto custom-scrollbar">
          <div className="space-y-3">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                1
              </Badge>
              Ponto de partida
            </h2>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Digite o CEP de origem"
                  className={cn(
                    "transition-all duration-200",
                    originError
                      ? "border-destructive ring-destructive/20 ring-2"
                      : ""
                  )}
                  value={originCep}
                  onChange={(e) => {
                    setOriginCep(e.target.value)
                    if (originError) setOriginError(null)
                  }}
                  onKeyDown={(e) => handleKeyPress(e, handleAddOrigin)}
                  disabled={isLoadingOrigin}
                />
                <Button
                  onClick={handleAddOrigin}
                  disabled={isLoadingOrigin || !originCep}
                  className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoadingOrigin ? <Spinner size="sm" /> : "Adicionar"}
                </Button>
              </div>
              {originError && (
                <p className="text-sm text-destructive flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="h-4 w-4" />
                  {originError}
                </p>
              )}
              {origin && (
                <div className="flex items-center gap-2 p-3 bg-background rounded-md border border-primary/20 animate-fadeIn shadow-sm">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <p className="text-sm font-medium">{origin.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                2
              </Badge>
              Endereços de entrega
            </h2>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Digite o CEP de destino"
                  className={cn(
                    "transition-all duration-200",
                    addressError
                      ? "border-destructive ring-destructive/20 ring-2"
                      : ""
                  )}
                  value={addressCep}
                  onChange={(e) => {
                    setAddressCep(e.target.value)
                    if (addressError) setAddressError(null)
                  }}
                  onKeyDown={(e) => handleKeyPress(e, handleAddAddress)}
                  disabled={isLoadingAddress}
                />
                <Button
                  onClick={handleAddAddress}
                  disabled={isLoadingAddress || !addressCep}
                  className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoadingAddress ? <Spinner size="sm" /> : "Adicionar"}
                </Button>
              </div>
              {addressError && (
                <p className="text-sm text-destructive flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="h-4 w-4" />
                  {addressError}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <h2 className="text-sm font-medium mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  3
                </Badge>
                Endereços adicionados
              </span>
              {addresses.length > 0 && (
                <Badge variant="outline">{addresses.length}</Badge>
              )}
            </h2>

            <div className="flex-1 overflow-auto min-h-[100px]">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="address-list">
                  {(provided) => (
                    <ul
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex flex-col gap-2"
                    >
                      {addresses.length === 0 ? (
                        <li className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
                          Adicione endereços para planejar sua rota
                        </li>
                      ) : (
                        addresses.map((address, index) => (
                          <Draggable
                            key={address.id}
                            draggableId={address.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  "flex items-center justify-between border p-3 rounded-lg bg-card shadow-sm transition-all duration-300",
                                  snapshot.isDragging
                                    ? "bg-primary/10 border-primary/30 shadow-lg scale-[1.02] rotate-1"
                                    : "hover:bg-primary/5 hover:border-primary/20 hover:shadow-md"
                                )}
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing p-1"
                                  >
                                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="bg-primary/5 shrink-0"
                                  >
                                    {address.deliveryOrder}
                                  </Badge>
                                  <span className="text-sm truncate">
                                    {address.description}
                                  </span>
                                </div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleRemoveAddress(address.id)
                                        }
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Remover endereço</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </li>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>

          <div className="space-y-4">
            <RouteOptimizerButton
              origin={origin}
              addresses={addresses}
              onOptimizeRoute={onOptimizeRoute}
              disabled={isCalculatingRoute}
            />
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 rounded-md"
              disabled={!origin || addresses.length < 1 || isCalculatingRoute}
              onClick={() => calculateRoute()}
            >
              {isCalculatingRoute ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>Calculando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  <span>Calcular rota</span>
                </div>
              )}
            </Button>
            <RouteStats
              origin={origin}
              addresses={addresses}
              isVisible={addresses.length > 0}
            />
          </div>
        </CardContent>
      </div>
    </Card>
  )
}