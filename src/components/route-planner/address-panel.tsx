"use client";

import { DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle, UploadCloud } from "lucide-react";
import type { RouteAddress } from "@/lib/route-manager";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { RouteOptimizerButton } from "./route-optimizer-button";
import { ImportWizardDialog } from "../import-wizard/import-wizard-dialog";
import { ManageAddressesPanel } from "./ManageAddressesDialog";
import { useState } from "react";

interface AddressPanelProps {
  originCep: string;
  setOriginCep: React.Dispatch<React.SetStateAction<string>>;
  origin: RouteAddress | null;
  originError: string | null;
  isLoadingOrigin: boolean;
  handleAddOrigin: () => void;
  addresses: RouteAddress[];
  setAddresses: React.Dispatch<React.SetStateAction<RouteAddress[]>>;
  calculateRoute: (forceReturn?: boolean) => void;
  isCalculatingRoute: boolean;
  isPanelExpanded: boolean;
  togglePanel: () => void;
  onOptimizeRoute: (optimizedAddresses: RouteAddress[]) => void;
  addressCep: string;
  setAddressCep: React.Dispatch<React.SetStateAction<string>>;
  addressError: string | null;
  isLoadingAddress: boolean;
  handleAddAddress: () => void;
  handleRemoveAddress: (id: string) => void;
  handleDragEnd: (result: DropResult) => void;
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
  const [importDialogOpen, setImportWizardOpen] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === "Enter") handler();
  };

  return (
    <Card className="h-full shadow-md border border-slate-200 rounded-3xl bg-white overflow-hidden relative transition-all duration-300">
      <div className="flex flex-col h-[calc(100%-80px)]">
        <CardContent className="pt-6 flex flex-col gap-8 h-full overflow-auto pb-40">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 p-1 rounded-full">
                <Badge
                  variant="outline"
                  className="bg-indigo-100 text-indigo-700 rounded-md text-xs uppercase tracking-wide"
                >
                  1
                </Badge>
              </div>
              <h2 className="text-base font-semibold text-gray-700">
                Ponto de partida
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Digite o CEP de origem"
                  className={cn(
                    "text-sm placeholder:text-gray-400 bg-slate-50 rounded-xl focus:ring-indigo-300 transition-all",
                    originError
                      ? "border-destructive ring-destructive/20 ring-2"
                      : ""
                  )}
                  value={originCep}
                  onChange={(e) => setOriginCep(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, handleAddOrigin)}
                  disabled={isLoadingOrigin}
                />
                <Button
                  onClick={handleAddOrigin}
                  disabled={isLoadingOrigin || !originCep}
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white rounded-2xl transition-all hover:scale-105 shadow-lg"
                  size="sm"
                >
                  {isLoadingOrigin ? <Spinner size="sm" /> : "Adicionar"}
                </Button>
              </div>
              {originError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {originError}
                </p>
              )}
              {origin && (
                <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl shadow-inner transition-all">
                  <MapPin className="h-5 w-5 text-indigo-500" />
                  <p className="text-sm text-gray-800 font-medium">
                    {origin.description}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 p-1 rounded-full">
                <Badge
                  variant="outline"
                  className="bg-indigo-100 text-indigo-700 rounded-md text-xs uppercase tracking-wide"
                >
                  2
                </Badge>
              </div>
              <h2 className="text-base font-semibold text-gray-700">
                Endereços de entrega
              </h2>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-indigo-200 hover:bg-indigo-50 transition-all hover:scale-105 rounded-xl shadow-sm"
              onClick={() => setImportWizardOpen(true)}
              disabled={isProcessingImport}
            >
              {isProcessingImport ? (
                <Spinner size="sm" />
              ) : (
                <UploadCloud className="w-4 h-4 text-indigo-500" />
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

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-white via-slate-50 to-white border-t border-slate-200 p-5 shadow-inner">
        <div className="space-y-4">
          <RouteOptimizerButton
            origin={origin}
            addresses={addresses}
            onOptimizeRoute={(optimizedAddresses) => {
              setAddresses(optimizedAddresses);
              calculateRoute(true);
            }}
            disabled={isCalculatingRoute}
          />

          <Button
            className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white rounded-2xl shadow-md hover:scale-105 transition hover:shadow-xl"
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
          setAddresses((prev) => [...prev, ...importedAddresses]);
          setImportProgress(0);
          setIsProcessingImport(false);
        }}
        existingAddresses={addresses}
        originCep={origin?.cep ?? ""}
      />
    </Card>
  );
}
