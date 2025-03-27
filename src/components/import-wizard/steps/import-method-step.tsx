"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileSpreadsheet,
  MapPin,
  UploadCloud,
  FileUp,
  Loader2,
} from "lucide-react"

interface ImportMethodStepProps {
  importMethod: "file" | "manual"
  setImportMethod: (method: "file" | "manual") => void
  fileInputRef: React.RefObject<HTMLInputElement>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  manualCeps: string
  setManualCeps: (ceps: string) => void
  processManualCeps: () => void
  isFileLoading?: boolean
}

export function ImportMethodStep({
  importMethod,
  setImportMethod,
  fileInputRef,
  handleFileChange,
  manualCeps,
  setManualCeps,
  processManualCeps,
  isFileLoading = false,
}: ImportMethodStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Importar endereços</h2>
        <p className="text-sm text-muted-foreground">
          Escolha a forma de adicionar endereços
        </p>
      </div>

      <Tabs
        value={importMethod}
        onValueChange={(v) => setImportMethod(v as "file" | "manual")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file" className="flex items-center gap-2 text-sm">
            <FileSpreadsheet className="w-4 h-4" />
            Arquivo CSV
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            CEPs manuais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <Card>
            <CardContent className="p-4">
              <div
                className="flex flex-col items-center gap-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <div>
                  {isFileLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <FileUp className="w-6 h-6" />
                  )}
                </div>

                <p className="text-sm font-medium">
                  {isFileLoading
                    ? "Processando arquivo..."
                    : "Clique para selecionar um arquivo CSV"}
                </p>
                <p className="text-sm text-muted-foreground">
                  O arquivo deve conter uma coluna de CEPs
                </p>

                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isFileLoading}
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  {isFileLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Carregando
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Selecionar CSV
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardContent className="p-4 space-y-4">
              <label className="text-sm font-medium block">
                CEPs (um por linha ou separados por vírgula)
              </label>
              <textarea
                className="w-full min-h-[140px] text-sm"
                placeholder="01001-000&#10;02002-000&#10;03003-000"
                value={manualCeps}
                onChange={(e) => setManualCeps(e.target.value)}
              />
              <Button
                onClick={processManualCeps}
                disabled={!manualCeps.trim()}
                size="sm"
                className="w-full"
              >
                Validar CEPs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
