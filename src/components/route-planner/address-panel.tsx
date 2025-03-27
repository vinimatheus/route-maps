"use client"

import { DropResult } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, AlertCircle, UploadCloud } from "lucide-react"
import type { RouteAddress } from "@/lib/route-manager"
import { Spinner } from "@/components/ui/spinner"
import { RouteOptimizerButton } from "./route-optimizer-button"
import { ImportWizardDialog } from "../import-wizard/import-wizard-dialog"
import { ManageAddressesPanel } from "./ManageAddressesDialog"
import { useState } from "react"

interface AddressPanelProps {
  originCep: string
  setOriginCep: React.Dispatch<React.SetStateAction<string>>
  origin: RouteAddress | null
  originError: string | null
  isLoadingOrigin: boolean
  handleAddOrigin: () => void
  addresses: RouteAddress[]
  setAddresses: React.Dispatch<React.SetStateAction<RouteAddress[]>>
  calculateRoute: (forceReturn?: boolean) => void
  isCalculatingRoute: boolean
  isPanelExpanded: boolean
  togglePanel: () => void
  onOptimizeRoute: (optimizedAddresses: RouteAddress[]) => void
  addressCep: string
  setAddressCep: React.Dispatch<React.SetStateAction<string>>
  addressError: string | null
  isLoadingAddress: boolean
  handleAddAddress: () => void
  handleRemoveAddress: (id: string) => void
  handleDragEnd: (result: DropResult) => void
}

export default function AddressPanel({
  originCep,
  setOriginCep,
  origin,
  originError,
  isLoadingOrigin,
  handleAddOrigin,
  addresses,
  setAddresses,
  calculateRoute,
  isCalculatingRoute,
  handleRemoveAddress,
  handleDragEnd,
}: AddressPanelProps) {
  const [importDialogOpen, setImportWizardOpen] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [isProcessingImport, setIsProcessingImport] = useState(false)

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === "Enter") handler()
  }

  return (
    <Card className="h-full">
      <div className="flex flex-col h-[calc(100%-80px)]">
        <CardContent className="pt-4 flex flex-col gap-6 h-full overflow-auto pb-32">
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">1</Badge>
              <h2 className="text-base font-medium">Ponto de partida</h2>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Digite o CEP de origem"
                  value={originCep}
                  onChange={(e) => setOriginCep(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, handleAddOrigin)}
                  disabled={isLoadingOrigin}
                />
                <Button
                  onClick={handleAddOrigin}
                  disabled={isLoadingOrigin || !originCep}
                  size="sm"
                >
                  {isLoadingOrigin ? <Spinner size="sm" /> : "Adicionar"}
                </Button>
              </div>
              {originError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {originError}
                </p>
              )}
              {origin && (
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <MapPin className="h-5 w-5" />
                  <p className="text-sm font-medium">{origin.description}</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">2</Badge>
              <h2 className="text-base font-medium">Endereços de entrega</h2>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setImportWizardOpen(true)}
              disabled={isProcessingImport}
            >
              {isProcessingImport ? (
                <Spinner size="sm" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              {importProgress > 0 && importProgress < 100
                ? `Importando ${importProgress}%`
                : "Importar planilha"}
            </Button>

            <ManageAddressesPanel
              addresses={addresses}
              onRemove={handleRemoveAddress}
              onDragEnd={handleDragEnd}
            />
          </section>
        </CardContent>
      </div>

      <div className="absolute bottom-0 left-0 w-full border-t p-4 bg-background">
        <div className="space-y-3">
          <RouteOptimizerButton
            origin={origin}
            addresses={addresses}
            onOptimizeRoute={(optimizedAddresses) => {
              setAddresses(optimizedAddresses)
              calculateRoute(true)
            }}
            disabled={isCalculatingRoute}
          />

          <Button
            className="w-full"
            disabled={!origin || addresses.length < 1 || isCalculatingRoute}
            onClick={() => calculateRoute()}
          >
            {isCalculatingRoute ? (
              <>
                <Spinner size="sm" /> Calculando...
              </>
            ) : (
              <>Calcular rota</>
            )}
          </Button>
        </div>
      </div>

      <ImportWizardDialog
        open={importDialogOpen}
        onClose={() => setImportWizardOpen(false)}
        onProcessing={setIsProcessingImport}
        onProgressChange={setImportProgress}
        onImportComplete={(importedAddresses) => {
          setAddresses((prev) => [...prev, ...importedAddresses])
          setImportProgress(0)
          setIsProcessingImport(false)
        }}
        existingAddresses={addresses}
        originCep={origin?.cep ?? ""}
      />
    </Card>
  )
}
