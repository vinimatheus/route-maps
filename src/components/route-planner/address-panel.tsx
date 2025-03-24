"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  MapPin,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Navigation,
  GripVertical,
  List,
} from "lucide-react";
import type { RouteAddress } from "@/lib/route-manager";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { RouteOptimizerButton } from "./route-optimizer-button";
import { RouteStats } from "./route-stats";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImportWizardDialog } from "../import-wizard/import-wizard-dialog";

interface AddressPanelProps {
  originCep: string;
  setOriginCep: React.Dispatch<React.SetStateAction<string>>;
  origin: RouteAddress | null;
  originError: string | null;
  isLoadingOrigin: boolean;
  handleAddOrigin: () => void;
  addressCep: string;
  setAddressCep: React.Dispatch<React.SetStateAction<string>>;
  addressError: string | null;
  isLoadingAddress: boolean;
  handleAddAddress: () => void;
  addresses: RouteAddress[];
  setAddresses: React.Dispatch<React.SetStateAction<RouteAddress[]>>;
  handleRemoveAddress: (id: string) => void;
  handleDragEnd: (result: DropResult) => void;
  calculateRoute: (forceReturn?: boolean) => void;
  isCalculatingRoute: boolean;
  isPanelExpanded: boolean;
  togglePanel: () => void;
  onOptimizeRoute: (optimizedAddresses: RouteAddress[]) => void;
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
  isPanelExpanded,
  togglePanel,
  onOptimizeRoute,
}: AddressPanelProps) {
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [editableAddresses, setEditableAddresses] = useState<RouteAddress[]>(
    []
  );
  const [importDialogOpen, setImportWizardOpen] = useState(false);

  const openManageDialog = () => {
    setEditableAddresses(addresses);
    setIsManageDialogOpen(true);
  };

  const saveDialogChanges = () => {
    setAddresses(editableAddresses);
    setIsManageDialogOpen(false);
  };

  const handleDragEndInDialog = (result: DropResult) => {
    if (!result.destination) return;
    const items = [...editableAddresses];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setEditableAddresses(items);
  };

  const removeAddressInDialog = (id: string) => {
    setEditableAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === "Enter") handler();
  };

  if (!isPanelExpanded) {
    return (
      <div className="h-full">
        <Button
          variant="outline"
          size="icon"
          aria-label="Expandir painel"
          className="fixed z-10 left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full shadow-md bg-background text-primary border border-primary/20 hover:bg-primary/5 hover:shadow-lg transition-all duration-300 hover:scale-105"
          onClick={togglePanel}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    );
  }
  return (
    <Card className="h-full shadow-sm border border-teal-100 overflow-hidden relative transition-all">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Recolher painel"
        className="absolute right-2 top-2 hidden lg:flex opacity-60 hover:opacity-100 hover:bg-teal-50 transition hover:scale-105"
        onClick={togglePanel}
      >
        <ChevronLeft className="h-5 w-5 text-teal-600" />
      </Button>

      <CardHeader className="bg-gradient-to-r from-white to-teal-50 pb-3 border-b border-teal-100">
        <CardTitle className="text-xl font-bold text-slate-700 flex items-center gap-2">
          <Navigation className="h-5 w-5 text-teal-500" />
          Planejar Rotas
        </CardTitle>
      </CardHeader>

      <div className="flex flex-col h-[calc(100%-60px)]">
        <CardContent className="pt-4 flex flex-col gap-6 h-full overflow-auto pb-36">
          {/* Origem */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-teal-100 text-teal-700 rounded-md"
              >
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
                    "text-sm placeholder:text-slate-400 focus:ring-teal-300",
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
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition hover:scale-105"
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
                <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-100 rounded-md shadow-sm">
                  <MapPin className="h-5 w-5 text-teal-500" />
                  <p className="text-sm text-slate-700 font-medium">
                    {origin.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Endereços */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-teal-100 text-teal-700 rounded-md"
              >
                2
              </Badge>
              Endereços de entrega
            </h2>
          <Button variant="outline" onClick={() => setImportWizardOpen(true)}>
            📥 Importar planilha
          </Button>
          </div>


          {/* Botão abrir dialog */}
          <div className="mt-4">
            {addresses.length > 0 && (
              <Button
                variant="secondary"
                className="w-full flex items-center gap-2 border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition hover:scale-105 rounded-xl"
                onClick={openManageDialog}
                size="sm"
              >
                <List className="h-4 w-4" />
                Ver endereços e reordenar
              </Button>
            )}
          </div>
        </CardContent>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-teal-100 p-4">
        <div className="space-y-4">
          <RouteOptimizerButton
            origin={origin}
            addresses={addresses}
            onOptimizeRoute={onOptimizeRoute}
            disabled={isCalculatingRoute}
          />
          <Button
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl shadow-sm hover:scale-105 transition"
            disabled={!origin || addresses.length < 1 || isCalculatingRoute}
            onClick={() => calculateRoute()}
          >
            {isCalculatingRoute ? (
              <>
                <Spinner size="sm" />
                Calculando...
              </>
            ) : (
              <>Calcular rota</>
            )}
          </Button>
          <RouteStats
            origin={origin}
            addresses={addresses}
            isVisible={addresses.length > 0}
          />
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-slate-700">
              Gerenciar Endereços
            </DialogTitle>
          </DialogHeader>
          <DragDropContext onDragEnd={handleDragEndInDialog}>
            <Droppable droppableId="dialog-address-list">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex flex-col gap-2 max-h-[60vh] overflow-auto"
                >
                  {editableAddresses.map((address, index) => (
                    <Draggable
                      key={address.id}
                      draggableId={address.id}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center justify-between border p-3 rounded-md bg-teal-50 shadow-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab p-1"
                            >
                              <GripVertical className="w-4 h-4 text-slate-400" />
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-teal-100 text-teal-700"
                            >
                              {address.deliveryOrder}
                            </Badge>
                            <span className="truncate max-w-[200px] text-slate-600">
                              {address.description}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-red-50 hover:scale-105"
                            onClick={() => removeAddressInDialog(address.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
          <DialogFooter className="pt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsManageDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={saveDialogChanges}
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-md hover:scale-105"
            >
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ImportWizardDialog
        open={importDialogOpen}
        onClose={() => setImportWizardOpen(false)}
        onImportComplete={(importedAddresses) =>
          setAddresses((prev) => [...prev, ...importedAddresses])
        }
      />
    </Card>
  );
}
