"use client"

import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

interface ValidationStepProps {
  progress: number
}

export function ValidationStep({ progress }: ValidationStepProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>

      <div className="text-center">
        <h3 className="text-xl font-semibold">Validando endereços</h3>
        <p className="text-sm text-muted-foreground">
          Consultando CEPs e geocodificando...
        </p>
      </div>

      <div className="w-full max-w-sm">
        <Progress value={progress} />
        <div className="flex justify-between text-xs mt-2">
          <span>Verificando...</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  )
}
