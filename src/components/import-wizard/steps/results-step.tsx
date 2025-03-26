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
  errorMessage?: string;
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
  const getErrorCount = () =>
    results.filter((r) => r.status === "error").length;

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
          <h2 className="text-xl font-semibold text-gray-800">Resultados</h2>
          <p className="text-sm text-gray-500 mt-1">
            {getSuccessCount()} endereços válidos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md px-2 py-1 text-xs font-medium">
            <CheckCircle className="w-4 h-4 mr-1" />
            {getSuccessCount()}
          </Badge>

          {getErrorCount() > 0 && (
            <Badge className="bg-rose-100 text-rose-700 border border-rose-200 rounded-md px-2 py-1 text-xs font-medium">
              <AlertCircle className="w-4 h-4 mr-1" />
              {getErrorCount()}
            </Badge>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
          <FileWarning className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-70" />
          <p className="text-sm text-gray-500">Nenhum resultado encontrado</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500 uppercase tracking-wide">
              <Filter className="w-3 h-3" />
              Filtros:
            </div>
            <div className="flex bg-slate-100 p-0.5 rounded-lg gap-1">
              {["all", "valid", "invalid"].map((f) => (
                <button
                  key={f}
                  className={cn(
                    "px-3 py-1 text-xs rounded-md transition font-medium",
                    filter === f
                      ? "bg-white shadow text-indigo-700"
                      : "text-gray-500 hover:text-gray-700"
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

          <div className="border rounded-xl overflow-hidden bg-white shadow-md">
            <div className="max-h-[260px] overflow-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold w-16">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">CEP</th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Descrição
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, i) => (
                    <motion.tr
                      key={result.cep + i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.015 }}
                      className={cn(
                        "hover:bg-slate-100 transition",
                        result.status === "error" && "bg-rose-50"
                      )}
                    >
                      <td className="px-4 py-2">
                        {result.status === "success" ? (
                          <CheckCircle className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500" />
                        )}
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-700">
                        {result.cep}
                      </td>
                      <td className="px-4 py-2 text-gray-500 truncate max-w-[200px]">
                        {result.status === "success"
                          ? result.data?.description || "-"
                          : result.errorMessage || "Inválido ou não encontrado"}
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
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
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
              className="flex items-center gap-1 text-gray-400 cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={getSuccessCount() === 0}
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white flex items-center gap-2 shadow-md hover:scale-105 hover:shadow-xl transition rounded-xl px-4 py-2"
          >
            <ListChecks className="w-4 h-4" />
            Adicionar à rota
          </Button>
        </div>
      </div>
    </div>
  );
}
