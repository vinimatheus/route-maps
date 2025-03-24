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

interface ImportWizardDialogProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: (addresses: RouteAddress[]) => void;
}

export function ImportWizardDialog({
  open,
  onClose,
  onImportComplete,
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
  } = useImportWizard();

  const handleConfirm = () => {
    const validAddresses = results
      .filter((r) => r.status === "success" && r.data)
      .map((r) => r.data!) as RouteAddress[];
    onImportComplete(validAddresses);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-md border shadow-md bg-white">
        <DialogHeader className="px-4 pt-4 pb-2 border-b bg-muted/20">
          <DialogTitle className="text-slate-700 text-base flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-teal-600" />
            Importar Endereços
          </DialogTitle>
          <div className="text-xs text-muted-foreground font-medium mt-1">
            Passo {currentStep} de 4
          </div>
        </DialogHeader>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-teal-500 rounded-r-full"
            initial={{ width: `${(currentStep - 1) * 25}%` }}
            animate={{ width: `${currentStep * 25}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Wizard body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <StepIndicator currentStep={currentStep} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              {currentStep === 1 && (
                <ImportMethodStep
                  importMethod={importMethod}
                  setImportMethod={setImportMethod}
                  fileInputRef={fileInputRef}
                  handleFileChange={handleFileChange}
                  manualCeps={manualCeps}
                  setManualCeps={setManualCeps}
                  processManualCeps={processManualCeps}
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
                  processCsv={() => file && processCsv(file, columnMapping)}
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
