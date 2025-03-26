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
    <div className="w-full pt-2 pb-6">
      <div className="relative h-1 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
          initial={{ width: `${(currentStep - 1) * 33}%` }}
          animate={{ width: `${(currentStep - 1) * 33}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      <div className="flex items-center justify-between mt-5">
        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div key={step.number} className="flex flex-col items-center w-1/4">
              <motion.div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-cyan-400 text-white shadow-md border-white animate-pulse"
                    : isCompleted
                    ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                    : "bg-slate-200 text-slate-400 border-slate-300"
                )}
                animate={isCompleted ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </motion.div>
              <span
                className={cn(
                  "text-[10px] mt-2 text-center uppercase tracking-wider font-medium",
                  isActive
                    ? "text-indigo-600"
                    : isCompleted
                    ? "text-indigo-500"
                    : "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
