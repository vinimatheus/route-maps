"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  AlertCircle,
  FileWarning,
  ListChecks,
  X,
  ArrowLeft,
  Filter,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { RouteAddress } from "@/lib/route-manager"
import { useState } from "react"

interface ResultItem {
  cep: string
  description?: string
  status: "success" | "error"
  data?: RouteAddress
  errorMessage?: string
}

interface ResultsStepProps {
  results: ResultItem[]
  getSuccessCount: () => number
  resetWizard: () => void
  handleConfirm: () => void
}

export function ResultsStep({
  results,
  getSuccessCount,
  resetWizard,
  handleConfirm,
}: ResultsStepProps) {
  const [filter, setFilter] = useState<"all" | "valid" | "invalid">("all")

  const getErrorCount = () =>
    results.filter((r) => r.status === "error").length

  const filteredResults = results.filter((result) => {
    if (filter === "all") return true
    if (filter === "valid") return result.status === "success"
    if (filter === "invalid") return result.status === "error"
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Resultados</h2>
          <p className="text-sm text-muted-foreground">
            {getSuccessCount()} endereços válidos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge>
            <CheckCircle className="w-4 h-4 mr-1" />
            {getSuccessCount()}
          </Badge>

          {getErrorCount() > 0 && (
            <Badge>
              <AlertCircle className="w-4 h-4 mr-1" />
              {getErrorCount()}
            </Badge>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-10">
          <FileWarning className="w-10 h-10 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Nenhum resultado encontrado
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm">
              <Filter className="w-4 h-4" />
              Filtros:
            </div>
            <div className="flex gap-1">
              {["all", "valid", "invalid"].map((f) => (
                <button
                  key={f}
                  className={cn(
                    "px-3 py-1 text-sm rounded-md",
                    filter === f && "font-semibold"
                  )}
                  onClick={() => setFilter(f as typeof filter)}
                >
                  {f === "all" && `Todos`}
                  {f === "valid" && `Válidos`}
                  {f === "invalid" && `Inválidos`}
                </button>
              ))}
            </div>
          </div>

          <div className="border rounded-md overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">CEP</th>
                  <th className="px-4 py-2 text-left">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, i) => (
                  <tr key={result.cep + i}>
                    <td className="px-4 py-2">
                      {result.status === "success" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </td>
                    <td className="px-4 py-2">{result.cep}</td>
                    <td className="px-4 py-2">
                      {result.status === "success"
                        ? result.data?.description || "-"
                        : result.errorMessage || "Inválido ou não encontrado"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" size="sm" onClick={resetWizard}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Reiniciar
        </Button>

        <div className="flex gap-2">
          {results.length > 0 && (
            <Button variant="outline" size="sm" disabled>
              <Download className="w-4 h-4 mr-1" />
              Exportar CSV
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={getSuccessCount() === 0}
          >
            <ListChecks className="w-4 h-4 mr-1" />
            Adicionar à rota
          </Button>
        </div>
      </div>
    </div>
  )
}
