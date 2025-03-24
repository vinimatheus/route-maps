"use client"

import type React from "react"

import { useState, useRef } from "react"
import Papa from "papaparse"
import { fetchCepData } from "@/lib/geocode-service"
import type { RouteAddress } from "@/lib/route-manager"

interface CsvRow {
  [key: string]: string
}

interface ColumnMapping {
  cep: string
  description?: string
}

export function useImportWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [csvColumns, setCsvColumns] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({ cep: "" })
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<
    { cep: string; description?: string; status: "success" | "error"; data?: RouteAddress }[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFileLoading, setIsFileLoading] = useState(false) // New state for file loading
  const [previewData, setPreviewData] = useState<CsvRow[]>([])
  const [importMethod, setImportMethod] = useState<"file" | "manual">("file")
  const [manualCeps, setManualCeps] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const uploadedFile = e.target.files[0]
      setFile(uploadedFile)
      setIsFileLoading(true) // Set loading state to true when file is selected

      Papa.parse(uploadedFile, {
        header: true,
        preview: 5, // Show only first 5 rows for preview
        complete: (parsed) => {
          const data = parsed.data as CsvRow[]
          setPreviewData(data)

          const headers = Object.keys((data[0] as Record<string, unknown>) || {})
          setCsvColumns(headers)

          // Auto-detect columns
          const possibleCepColumns = headers.filter(
            (h) =>
              h.toLowerCase().includes("cep") || h.toLowerCase().includes("postal") || h.toLowerCase().includes("zip"),
          )

          const possibleDescColumns = headers.filter(
            (h) =>
              h.toLowerCase().includes("desc") ||
              h.toLowerCase().includes("end") ||
              h.toLowerCase().includes("address") ||
              h.toLowerCase().includes("local"),
          )

          if (possibleCepColumns.length > 0) {
            setColumnMapping((prev) => ({ ...prev, cep: possibleCepColumns[0] }))
          }

          if (possibleDescColumns.length > 0) {
            setColumnMapping((prev) => ({ ...prev, description: possibleDescColumns[0] }))
          }

          setIsFileLoading(false) // Set loading state to false when parsing is complete
          setCurrentStep(2)
        },
        error: () => {
          setIsFileLoading(false) // Set loading state to false if there's an error
        },
      })
    }
  }

  const processCsv = async (file: File, mapping: ColumnMapping) => {
    setIsLoading(true)
    setProgress(0)
    setResults([])
    setCurrentStep(3)

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        const lines = parsed.data
        const total = lines.length
        const tempResults: typeof results = []

        for (let i = 0; i < lines.length; i++) {
          const rawCep = lines[i][mapping.cep]?.trim()
          const description = mapping.description ? lines[i][mapping.description]?.trim() : undefined
          const cep = rawCep?.replace(/\D/g, "") // normalize

          if (!cep || cep.length !== 8) {
            tempResults.push({
              cep: rawCep ?? "Inválido",
              description,
              status: "error",
            })
          } else {
            try {
              const location = await fetchCepData(cep)
              if (location) {
                tempResults.push({
                  cep,
                  description: description || location.description,
                  status: "success",
                  data: {
                    id: `${cep}-${Date.now() + i}`,
                    description: description || location.description,
                    lat: location.lat,
                    lng: location.lng,
                    isGeocoded: true,
                    deliveryOrder: tempResults.length + 1,
                    isChecked: false,
                  },
                })
              } else {
                tempResults.push({ cep, description, status: "error" })
              }
            } catch {
              tempResults.push({ cep, description, status: "error" })
            }
          }
          setProgress(Math.round(((i + 1) / total) * 100))
        }

        setResults(tempResults)
        setIsLoading(false)
        setCurrentStep(4)
      },
    })
  }

  const processManualCeps = async () => {
    setIsLoading(true)
    setProgress(0)
    setResults([])
    setCurrentStep(3)

    const cepList = manualCeps
      .split(/[\n,;]/)
      .map((cep) => cep.trim())
      .filter((cep) => cep.length > 0)

    const total = cepList.length
    const tempResults: typeof results = []

    for (let i = 0; i < cepList.length; i++) {
      const rawCep = cepList[i]
      const cep = rawCep.replace(/\D/g, "") // normalize

      if (!cep || cep.length !== 8) {
        tempResults.push({ cep: rawCep, status: "error" })
      } else {
        try {
          const location = await fetchCepData(cep)
          if (location) {
            tempResults.push({
              cep,
              status: "success",
              data: {
                id: `${cep}-${Date.now() + i}`,
                description: location.description,
                lat: location.lat,
                lng: location.lng,
                isGeocoded: true,
                deliveryOrder: tempResults.length + 1,
                isChecked: false,
              },
            })
          } else {
            tempResults.push({ cep, status: "error" })
          }
        } catch {
          tempResults.push({ cep, status: "error" })
        }
      }
      setProgress(Math.round(((i + 1) / total) * 100))
    }

    setResults(tempResults)
    setIsLoading(false)
    setCurrentStep(4)
  }

  const resetWizard = () => {
    setCurrentStep(1)
    setFile(null)
    setCsvColumns([])
    setColumnMapping({ cep: "" })
    setProgress(0)
    setResults([])
    setIsLoading(false)
    setIsFileLoading(false) // Reset file loading state
    setPreviewData([])
    setManualCeps("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getSuccessCount = () => results.filter((r) => r.status === "success").length

  return {
    currentStep,
    file,
    csvColumns,
    columnMapping,
    progress,
    results,
    isLoading,
    isFileLoading, // Expose the new file loading state
    previewData,
    importMethod,
    manualCeps,
    fileInputRef,
    handleFileChange,
    processCsv,
    processManualCeps,
    setImportMethod,
    setManualCeps,
    setColumnMapping,
    resetWizard,
    getSuccessCount,
  }
}

