"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet,
  ChevronRight,
  ArrowLeft,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface ColumnMapping {
  cep: string;
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
          <h2 className="text-xl font-semibold text-gray-800">
            Mapeie a coluna de CEP
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Selecione a coluna do arquivo que contém os CEPs
          </p>
        </div>

        <Badge className="flex items-center gap-1.5 bg-indigo-100 border border-indigo-200 text-indigo-700 px-2 py-1 text-xs rounded-md">
          <FileSpreadsheet className="w-4 h-4" />
          <span className="max-w-[150px] truncate">{file?.name}</span>
        </Badge>
      </div>

      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wide font-medium text-gray-600">
          Coluna de CEP <span className="text-red-500">*</span>
        </label>
        <Select
          value={columnMapping.cep}
          onValueChange={(value) =>
            setColumnMapping({ ...columnMapping, cep: value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a coluna" />
          </SelectTrigger>
          <SelectContent>
            {csvColumns.map((col) => (
              <SelectItem key={col} value={col}>
                {col}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 border rounded-xl shadow-md overflow-hidden bg-white">
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-slate-100">
          <Table2 className="w-4 h-4 text-indigo-500" />
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Pré-visualização
          </h3>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y text-xs">
            <thead className="bg-slate-50">
              <tr>
                {csvColumns.map((col) => (
                  <th
                    key={col}
                    className={cn(
                      "px-3 py-2 text-left font-semibold text-gray-600",
                      col === columnMapping.cep && "bg-indigo-50 text-indigo-700"
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
                  className="hover:bg-slate-100 transition"
                >
                  {csvColumns.map((col) => (
                    <td
                      key={col}
                      className="px-3 py-2 text-gray-700 truncate max-w-[180px]"
                    >
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
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <Button
          onClick={processCsv}
          disabled={!columnMapping.cep}
          size="sm"
          className="bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white flex items-center gap-2 shadow-md hover:scale-105 hover:shadow-xl transition rounded-xl px-4 py-2"
        >
          Validar
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
