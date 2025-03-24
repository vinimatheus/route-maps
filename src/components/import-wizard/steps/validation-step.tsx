"use client";

import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ValidationStepProps {
  progress: number;
}

export function ValidationStep({ progress }: ValidationStepProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 space-y-6">
      <div className="flex items-center justify-center w-20 h-20 rounded-full border border-teal-200 bg-teal-50 shadow-inner">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-700">
          Validando endereços
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          Consultando CEPs e geocodificando...
        </p>
      </div>

      <div className="w-full max-w-sm">
        <Progress value={progress} className="h-2 rounded-full" />
        <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
          <span>Verificando...</span>
          <span className="font-medium text-slate-700">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
