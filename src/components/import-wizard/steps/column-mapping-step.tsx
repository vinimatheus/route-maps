"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileSpreadsheet,
  ChevronRight,
  ArrowLeft,
  Table2,
} from "lucide-react"
import { motion } from "framer-motion"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

interface ColumnMapping {
  cep: string
}

interface CsvRow {
  [key: string]: string
}

interface ColumnMappingStepProps {
  file: File | null
  csvColumns: string[]
  columnMapping: ColumnMapping
  setColumnMapping: (mapping: ColumnMapping) => void
  previewData: CsvRow[]
  resetWizard: () => void
  processCsv: () => void
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
          <h2 className="text-xl font-semibold">Mapeie a coluna de CEP</h2>
          <p className="text-sm text-muted-foreground">
            Selecione a coluna do arquivo que contém os CEPs
          </p>
        </div>

        <Badge>
          <FileSpreadsheet className="w-4 h-4" />
          <span className="truncate">{file?.name}</span>
        </Badge>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Coluna de CEP <span className="text-destructive">*</span>
        </label>
        <Select
          value={columnMapping.cep}
          onValueChange={(value) =>
            setColumnMapping({ ...columnMapping, cep: value })
          }
        >
          <SelectTrigger>
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

      <div className="border rounded-md">
        <div className="flex items-center gap-2 p-4 border-b">
          <Table2 className="w-4 h-4" />
          <h3 className="text-sm font-medium">Pré-visualização</h3>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {csvColumns.map((col) => (
                  <th key={col} className="p-2 font-semibold">
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
                >
                  {csvColumns.map((col) => (
                    <td key={col} className="p-2">
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
        <Button variant="outline" size="sm" onClick={resetWizard}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          onClick={processCsv}
          disabled={!columnMapping.cep}
          size="sm"
        >
          Validar
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
