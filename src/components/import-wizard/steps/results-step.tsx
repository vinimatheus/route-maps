"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  FileWarning,
  ListChecks,
  X,
  ArrowLeft,
  Filter,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { RouteAddress } from "@/lib/route-manager";
import { useState } from "react";

interface ResultItem {
  cep: string;
  description?: string;
  status: "success" | "error";
  data?: RouteAddress;
}

interface ResultsStepProps {
  results: ResultItem[];
  getSuccessCount: () => number;
  resetWizard: () => void;
  handleConfirm: () => void;
}

export function ResultsStep({
  results,
  getSuccessCount,
  resetWizard,
  handleConfirm,
}: ResultsStepProps) {
  const [filter, setFilter] = useState<"all" | "valid" | "invalid">("all");
  const getErrorCount = () => results.filter((r) => r.status === "error").length;

  const filteredResults = results.filter((result) => {
    if (filter === "all") return true;
    if (filter === "valid") return result.status === "success";
    if (filter === "invalid") return result.status === "error";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-700">Resultados</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {getSuccessCount()} endereços válidos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-teal-100 text-teal-700 rounded-md px-2 py-1 text-xs">
            <CheckCircle className="w-4 h-4 mr-1" />
            {getSuccessCount()}
          </Badge>

          {getErrorCount() > 0 && (
            <Badge className="bg-rose-100 text-rose-700 rounded-md px-2 py-1 text-xs">
              <AlertCircle className="w-4 h-4 mr-1" />
              {getErrorCount()}
            </Badge>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-md border border-border/30">
          <FileWarning className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-sm text-muted-foreground">Nenhum resultado</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Filter className="w-3 h-3" />
              Filtros:
            </div>
            <div className="flex bg-muted/30 p-0.5 rounded-md gap-1">
              {["all", "valid", "invalid"].map((f) => (
                <button
                  key={f}
                  className={cn(
                    "px-2 py-1 text-xs rounded-md transition",
                    filter === f
                      ? "bg-background shadow text-slate-700"
                      : "text-muted-foreground hover:text-foreground"
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

          <div className="border rounded-md overflow-hidden bg-white shadow-sm">
            <div className="max-h-[250px] overflow-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-border/30 text-sm">
                <thead className="sticky top-0 bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium w-16">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left font-medium">CEP</th>
                    <th className="px-3 py-2 text-left font-medium">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, i) => (
                    <motion.tr
                      key={result.cep + i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.01 }}
                      className={cn(
                        "hover:bg-muted/10 transition",
                        result.status === "error" && "bg-rose-50"
                      )}
                    >
                      <td className="px-3 py-2">
                        {result.status === "success" ? (
                          <CheckCircle className="w-4 h-4 text-teal-600" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500" />
                        )}
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-600">
                        {result.cep}
                      </td>
                      <td className="px-3 py-2 text-slate-500 truncate max-w-[180px]">
                        {result.status === "success"
                          ? result.data?.description || "-"
                          : "Inválido ou não encontrado"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-between items-center gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={resetWizard}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Reiniciar
        </Button>

        <div className="flex gap-2">
          {results.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="flex items-center gap-1 text-muted-foreground cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={getSuccessCount() === 0}
            className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-1 shadow-sm hover:scale-105 transition rounded-md"
          >
            <ListChecks className="w-4 h-4" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}
