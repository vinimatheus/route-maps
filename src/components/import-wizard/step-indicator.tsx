"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckIcon } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: "Método" },
    { number: 2, label: "Colunas" },
    { number: 3, label: "Validação" },
    { number: 4, label: "Resultados" },
  ];

  return (
    <div className="w-full pt-2 pb-4">
      <div className="relative h-1 bg-muted/40 rounded-full">
        <motion.div
          className="absolute top-0 left-0 h-1 bg-teal-500 rounded-full"
          initial={{ width: `${(currentStep - 1) * 33}%` }}
          animate={{ width: `${(currentStep - 1) * 33}%` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>

      <div className="flex items-center justify-between mt-4">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center w-1/4">
            <motion.div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                currentStep === step.number
                  ? "bg-teal-500 text-white shadow"
                  : currentStep > step.number
                  ? "bg-teal-100 text-teal-700"
                  : "bg-muted/50 text-muted-foreground"
              )}
              animate={currentStep > step.number ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {currentStep > step.number ? (
                <CheckIcon className="w-3 h-3" />
              ) : (
                step.number
              )}
            </motion.div>
            <span
              className={cn(
                "text-[10px] mt-1 text-center font-medium",
                currentStep === step.number
                  ? "text-teal-600"
                  : currentStep > step.number
                  ? "text-teal-500"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
