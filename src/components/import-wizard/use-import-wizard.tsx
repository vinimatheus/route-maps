"use client";

import type React from "react";
import { useState, useRef } from "react";
import Papa from "papaparse";
import { fetchCepData } from "@/lib/geocode-service";
import type { RouteAddress } from "@/lib/route-manager";

interface CsvRow {
  [key: string]: string;
}

interface ColumnMapping {
  cep: string;
}

export function useImportWizard(existingAddresses: RouteAddress[], originCep?: string) {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({ cep: "" });
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<
    { cep: string; status: "success" | "error"; data?: RouteAddress; errorMessage?: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [previewData, setPreviewData] = useState<CsvRow[]>([]);
  const [importMethod, setImportMethod] = useState<"file" | "manual">("file");
  const [manualCeps, setManualCeps] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const uploadedFile = e.target.files[0];
      setFile(uploadedFile);
      setIsFileLoading(true);

      Papa.parse(uploadedFile, {
        header: true,
        preview: 5,
        complete: (parsed) => {
          const data = parsed.data as CsvRow[];
          setPreviewData(data);

          const headers = Object.keys((data[0] as Record<string, unknown>) || {});
          setCsvColumns(headers);

          const possibleCepColumns = headers.filter(
            (h) =>
              h.toLowerCase().includes("cep") ||
              h.toLowerCase().includes("postal") ||
              h.toLowerCase().includes("zip")
          );

          if (possibleCepColumns.length > 0) {
            setColumnMapping({ cep: possibleCepColumns[0] });
          }

          setIsFileLoading(false);
          setCurrentStep(2);
        },
        error: () => {
          setIsFileLoading(false);
        },
      });
    }
  };

  const processCsv = async (file: File, mapping: ColumnMapping) => {
    setIsLoading(true);
    setProgress(0);
    setResults([]);
    setCurrentStep(3);

    const processedCeps = new Set<string>();
    const tempResults: typeof results = [];

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        const lines = parsed.data;
        const total = lines.length;

        for (let i = 0; i < lines.length; i++) {
          const rawCep = lines[i][mapping.cep]?.trim() || "";
          const cep = rawCep.replace(/\D/g, "");

          if (!cep || cep.length !== 8) {
            tempResults.push({
              cep: rawCep,
              status: "error",
              errorMessage: "CEP inválido (8 dígitos obrigatórios)",
            });
            continue;
          }

          if (cep === originCep) {
            tempResults.push({
              cep,
              status: "error",
              errorMessage: "CEP igual ao da origem",
            });
            continue;
          }

          if (existingAddresses.some((addr) => addr.cep === cep)) {
            tempResults.push({
              cep,
              status: "error",
              errorMessage: "CEP já adicionado anteriormente",
            });
            continue;
          }

          if (processedCeps.has(cep)) {
            tempResults.push({
              cep,
              status: "error",
              errorMessage: "Duplicado no arquivo",
            });
            continue;
          }

          processedCeps.add(cep);
          try {
            const location = await fetchCepData(cep);
            if (location) {
              tempResults.push({
                cep,
                status: "success",
                data: {
                  id: `${cep}-${Date.now() + i}`,
                  cep,
                  description: location.description,
                  lat: location.lat,
                  lng: location.lng,
                  isGeocoded: true,
                  deliveryOrder: tempResults.length + 1,
                  isChecked: false,
                },
              });
            } else {
              tempResults.push({
                cep,
                status: "error",
                errorMessage: "CEP não encontrado",
              });
            }
          } catch {
            tempResults.push({
              cep,
              status: "error",
              errorMessage: "Erro ao consultar CEP",
            });
          }

          setProgress(Math.round(((i + 1) / total) * 100));
        }

        setResults(tempResults);
        setIsLoading(false);
        setCurrentStep(4);
      },
    });
  };

  const processManualCeps = async () => {
    setIsLoading(true);
    setProgress(0);
    setResults([]);
    setCurrentStep(3);

    const cepList = manualCeps
      .split(/[\n,;]/)
      .map((cep) => cep.trim())
      .filter((cep) => cep.length > 0);

    const total = cepList.length;
    const processedCeps = new Set<string>();
    const tempResults: typeof results = [];

    for (let i = 0; i < cepList.length; i++) {
      const rawCep = cepList[i];
      const cep = rawCep.replace(/\D/g, "");

      if (!cep || cep.length !== 8) {
        tempResults.push({
          cep: rawCep,
          status: "error",
          errorMessage: "CEP inválido ou mal formatado",
        });
      } else if (cep === originCep) {
        tempResults.push({
          cep,
          status: "error",
          errorMessage: "CEP é o mesmo da origem",
        });
      } else if (existingAddresses.some((addr) => addr.cep === cep)) {
        tempResults.push({
          cep,
          status: "error",
          errorMessage: "CEP já adicionado anteriormente",
        });
      } else if (processedCeps.has(cep)) {
        tempResults.push({
          cep,
          status: "error",
          errorMessage: "CEP duplicado na lista",
        });
      } else {
        processedCeps.add(cep);
        try {
          const location = await fetchCepData(cep);
          if (location) {
            tempResults.push({
              cep,
              status: "success",
              data: {
                id: `${cep}-${Date.now() + i}`,
                cep,
                description: location.description,
                lat: location.lat,
                lng: location.lng,
                isGeocoded: true,
                deliveryOrder: tempResults.length + 1,
                isChecked: false,
              },
            });
          } else {
            tempResults.push({
              cep,
              status: "error",
              errorMessage: "CEP não encontrado",
            });
          }
        } catch {
          tempResults.push({
            cep,
            status: "error",
            errorMessage: "Erro ao consultar CEP",
          });
        }
      }
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    setResults(tempResults);
    setIsLoading(false);
    setCurrentStep(4);
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setFile(null);
    setCsvColumns([]);
    setColumnMapping({ cep: "" });
    setProgress(0);
    setResults([]);
    setIsLoading(false);
    setIsFileLoading(false);
    setPreviewData([]);
    setManualCeps("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getSuccessCount = () => results.filter((r) => r.status === "success").length;

  return {
    currentStep,
    file,
    csvColumns,
    columnMapping,
    progress,
    results,
    isLoading,
    isFileLoading,
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
  };
}
