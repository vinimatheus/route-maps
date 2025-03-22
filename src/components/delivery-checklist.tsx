"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, RotateCw } from "lucide-react";
import { RouteAddress } from "@/lib/route-manager";

interface DeliveryChecklistProps {
  addresses: RouteAddress[];
  onAddressCheck: (id: string, isChecked: boolean) => void;
  onReturnToOrigin: () => void;
  allCompleted: boolean;
}

export default function DeliveryChecklist({
  addresses,
  onAddressCheck,
  onReturnToOrigin,
  allCompleted,
}: DeliveryChecklistProps) {
  const [includeReturn, setIncludeReturn] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Planejador de Entregas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum endereço adicionado</p>
        ) : (
          <>
            {allCompleted && (
              <div className="p-3 mb-3 rounded-lg bg-green-100 border border-green-300 text-green-800 flex items-center justify-center">
                <Check className="h-5 w-5 mr-2" />
                <p className="text-sm font-medium">Todas as entregas foram concluídas!</p>
              </div>
            )}
            <ul className="flex flex-col gap-2 max-h-[300px] overflow-auto">
              {addresses.map((address) => (
                <li
                  key={address.id}
                  className="flex items-center justify-between border p-3 rounded-lg bg-card shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {address.deliveryOrder || "?"}  
                    </span>
                    <span className={`text-sm ${address.isChecked ? "line-through text-muted-foreground" : ""}`}>
                      {address.description}
                    </span>
                  </div>
                  <Button
                    variant={address.isChecked ? "outline" : "default"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => onAddressCheck(address.id, !address.isChecked)}
                  >
                    {address.isChecked ? "Desmarcar" : "Incluir"}
                    {address.isChecked && <Check className="ml-1 h-4 w-4" />}
                  </Button>
                </li>
              ))}
            </ul>

            <div className="mt-2 p-3 border rounded-lg bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="includeReturn"
                  checked={includeReturn}
                  onChange={(e) => setIncludeReturn(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="includeReturn" className="text-sm font-medium">
                  Incluir retorno ao ponto de partida no planejamento
                </label>
              </div>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-1"
                onClick={() => {
                  if (includeReturn && !isReturning) {
                    setIsReturning(true);
                    onReturnToOrigin();
                    // Reset the loading state after a short delay
                    setTimeout(() => setIsReturning(false), 1000);
                  }
                }}
                disabled={!includeReturn || isReturning}
              >
                {isReturning ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                    Planejando...
                  </>
                ) : (
                  <>
                    <RotateCw className="h-4 w-4" />
                    Planejar com retorno ao ponto de partida
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}