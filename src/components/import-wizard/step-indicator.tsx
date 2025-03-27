"use client"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: "Método" },
    { number: 2, label: "Colunas" },
    { number: 3, label: "Validação" },
    { number: 4, label: "Resultados" },
  ]

  return (
    <div className="w-full">
      <div className="h-1 bg-muted w-full rounded" />

      <div className="flex items-center justify-between mt-4">
        {steps.map((step) => {
          const isCompleted = currentStep > step.number
          const isActive = currentStep === step.number

          return (
            <div key={step.number} className="flex flex-col items-center w-1/4">
              <div
                className={cn(
                  "w-8 h-8 rounded-full border flex items-center justify-center text-sm",
                  isActive && "font-bold",
                  isCompleted && "text-primary",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                {isCompleted ? <CheckIcon className="w-4 h-4" /> : step.number}
              </div>
              <span className="text-xs mt-1 text-center">{step.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
