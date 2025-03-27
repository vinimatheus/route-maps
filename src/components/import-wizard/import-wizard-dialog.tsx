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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5" />
            Importar Endereços
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm">Passo {currentStep} de 4</div>

        <div className="h-1 w-full bg-muted relative mt-2">
          <motion.div
            className="h-full bg-primary absolute left-0 top-0"
            initial={{ width: `${(currentStep - 1) * 25}%` }}
            animate={{ width: `${currentStep * 25}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="mt-4">
          <StepIndicator currentStep={currentStep} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              {currentStep === 1 && (
                <ImportMethodStep
                  importMethod={importMethod}
                  setImportMethod={setImportMethod}
                  fileInputRef={
                    fileInputRef as React.RefObject<HTMLInputElement>
                  }
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
