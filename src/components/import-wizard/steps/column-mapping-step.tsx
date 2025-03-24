"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileSpreadsheet,
  Info,
  ChevronRight,
  ArrowLeft,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ColumnMapping {
  cep: string;
  description?: string;
}

interface CsvRow {
  [key: string]: string;
}

interface ColumnMappingStepProps {
  file: File | null;
  csvColumns: string[];
  columnMapping: ColumnMapping;
  setColumnMapping: (mapping: ColumnMapping) => void;
  previewData: CsvRow[];
  resetWizard: () => void;
  processCsv: () => void;
}

export function ColumnMappingStep({
  file,
  csvColumns,
  columnMapping,
  setColumnMapping,
  previewData,
  resetWizard,
  processCsv,
}: ColumnMappingStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-700">Mapeie as colunas</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Selecione as colunas correspondentes aos dados do CSV
          </p>
        </div>

        <Badge className="flex items-center gap-1.5 bg-teal-100 text-teal-700 px-2 py-1 text-xs rounded-md">
          <FileSpreadsheet className="w-4 h-4" />
          <span className="max-w-[150px] truncate">{file?.name}</span>
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600">
            Coluna de CEP <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              className="w-full border p-2.5 pr-8 rounded-md bg-white focus:ring-2 focus:ring-teal-300 text-sm shadow-sm"
              value={columnMapping.cep}
              onChange={(e) =>
                setColumnMapping({ ...columnMapping, cep: e.target.value })
              }
            >
              <option value="">Selecione...</option>
              {csvColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              ▼
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <label className="text-xs font-medium text-slate-600">
              Descrição (opcional)
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent className="text-xs text-slate-600 bg-white border shadow-sm">
                  O texto desta coluna será exibido no lugar do CEP, se preenchido.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <select
              className="w-full border p-2.5 pr-8 rounded-md bg-white focus:ring-2 focus:ring-cyan-300 text-sm shadow-sm"
              value={columnMapping.description || ""}
              onChange={(e) =>
                setColumnMapping({
                  ...columnMapping,
                  description: e.target.value || undefined,
                })
              }
            >
              <option value="">Nenhuma</option>
              {csvColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              ▼
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border rounded-md shadow-sm overflow-hidden bg-white">
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/20">
          <Table2 className="w-4 h-4 text-teal-600" />
          <h3 className="text-xs font-medium text-slate-600">Pré-visualização</h3>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y text-xs">
            <thead className="bg-muted/30">
              <tr>
                {csvColumns.map((col) => (
                  <th
                    key={col}
                    className={cn(
                      "px-3 py-2 text-left font-semibold text-slate-500",
                      (col === columnMapping.cep || col === columnMapping.description) &&
                        "bg-teal-50 text-teal-700"
                    )}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className="hover:bg-muted/10 transition"
                >
                  {csvColumns.map((col) => (
                    <td key={col} className="px-3 py-2 text-slate-600 truncate">
                      {row[col] || "-"}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={resetWizard}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <Button
          onClick={processCsv}
          disabled={!columnMapping.cep}
          size="sm"
          className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-1 shadow-sm hover:scale-105 transition rounded-md"
        >
          Validar
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
