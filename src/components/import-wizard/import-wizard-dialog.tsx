"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadCloud } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { StepIndicator } from "./step-indicator";
import { ImportMethodStep } from "./steps/import-method-step";
import { ColumnMappingStep } from "./steps/column-mapping-step";
import { ValidationStep } from "./steps/validation-step";
import { ResultsStep } from "./steps/results-step";
import type { RouteAddress } from "@/lib/route-manager";
import { useImportWizard } from "./use-import-wizard";
import { useEffect } from "react";

interface ImportWizardDialogProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: (addresses: RouteAddress[]) => void;
  onProcessing?: (processing: boolean) => void;
  onProgressChange?: (progress: number) => void;
  existingAddresses: RouteAddress[];
  originCep?: string;
}

export function ImportWizardDialog({
  open,
  onClose,
  onImportComplete,
  onProcessing,
  onProgressChange,
  existingAddresses,
  originCep,
}: ImportWizardDialogProps) {
  const {
    currentStep,
    file,
    csvColumns,
    columnMapping,
    progress,
    results,
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
  } = useImportWizard(existingAddresses, originCep);

  const handleConfirm = () => {
    const validAddresses = results
      .filter((r) => r.status === "success" && r.data)
      .map((r) => r.data!) as RouteAddress[];
    onImportComplete(validAddresses);
    onClose();
  };

  const handleProcessCsv = () => {
    if (file) {
      onProcessing?.(true);
      processCsv(file, columnMapping).finally(() => onProcessing?.(false));
    }
  };

  const handleProcessManualCeps = () => {
    onProcessing?.(true);
    processManualCeps().finally(() => onProcessing?.(false));
  };

  useEffect(() => {
    onProgressChange?.(progress);
  }, [progress, onProgressChange]);

  useEffect(() => {
    if (!open) {
      onProcessing?.(false);
      onProgressChange?.(0);
    }
  }, [open, onProcessing, onProgressChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
          onProcessing?.(false);
          onProgressChange?.(0);
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-indigo-50 to-cyan-50 border-b border-slate-200 rounded-t-2xl">
          <DialogTitle className="text-gray-700 text-lg flex items-center gap-3 font-semibold">
            <UploadCloud className="w-6 h-6 text-indigo-500" />
            Importar Endereços
          </DialogTitle>
          <div className="text-xs text-gray-500 font-medium mt-1">
            Passo {currentStep} de 4
          </div>
        </DialogHeader>

        <div className="h-1 bg-slate-200 relative overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-r-full absolute left-0 top-0"
            initial={{ width: `${(currentStep - 1) * 25}%` }}
            animate={{ width: `${currentStep * 25}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 bg-white">
          <StepIndicator currentStep={currentStep} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mt-6"
            >
              {currentStep === 1 && (
                <ImportMethodStep
                  importMethod={importMethod}
                  setImportMethod={setImportMethod}
                  fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                  handleFileChange={handleFileChange}
                  manualCeps={manualCeps}
                  setManualCeps={setManualCeps}
                  processManualCeps={handleProcessManualCeps}
                  isFileLoading={isFileLoading}
                />
              )}

              {currentStep === 2 && (
                <ColumnMappingStep
                  file={file}
                  csvColumns={csvColumns}
                  columnMapping={columnMapping}
                  setColumnMapping={setColumnMapping}
                  previewData={previewData}
                  resetWizard={resetWizard}
                  processCsv={handleProcessCsv}
                />
              )}

              {currentStep === 3 && <ValidationStep progress={progress} />}

              {currentStep === 4 && (
                <ResultsStep
                  results={results}
                  getSuccessCount={getSuccessCount}
                  resetWizard={resetWizard}
                  handleConfirm={handleConfirm}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
