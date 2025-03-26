"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileSpreadsheet,
  MapPin,
  UploadCloud,
  FileUp,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ImportMethodStepProps {
  importMethod: "file" | "manual";
  setImportMethod: (method: "file" | "manual") => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  manualCeps: string;
  setManualCeps: (ceps: string) => void;
  processManualCeps: () => void;
  isFileLoading?: boolean;
}

export function ImportMethodStep({
  importMethod,
  setImportMethod,
  fileInputRef,
  handleFileChange,
  manualCeps,
  setManualCeps,
  processManualCeps,
  isFileLoading = false,
}: ImportMethodStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Importar endereços
        </h2>
        <p className="text-sm text-gray-500">
          Escolha a forma de adicionar endereços
        </p>
      </div>

      <Tabs
        value={importMethod}
        onValueChange={(v) => setImportMethod(v as "file" | "manual")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4 p-1 bg-slate-100 rounded-xl shadow-inner">
          <TabsTrigger
            value="file"
            className="flex items-center gap-2 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-indigo-600"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Arquivo CSV
          </TabsTrigger>
          <TabsTrigger
            value="manual"
            className="flex items-center gap-2 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-indigo-600"
          >
            <MapPin className="w-4 h-4" />
            CEPs manuais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-0">
          <Card className="border border-dashed border-slate-300 bg-slate-50 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <motion.div
                className={cn(
                  "text-center flex flex-col items-center gap-4 cursor-pointer",
                  isFileLoading && "opacity-60 pointer-events-none"
                )}
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="p-3 rounded-full bg-indigo-100"
                  animate={
                    isFileLoading
                      ? { rotate: 360 }
                      : { y: [0, -4, 0] }
                  }
                  transition={
                    isFileLoading
                      ? { repeat: Infinity, duration: 1.5, ease: "linear" }
                      : { repeat: Infinity, duration: 2, repeatType: "reverse", ease: "easeInOut" }
                  }
                >
                  {isFileLoading ? (
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                  ) : (
                    <FileUp className="w-6 h-6 text-indigo-500" />
                  )}
                </motion.div>

                <p className="text-sm font-medium text-gray-700">
                  {isFileLoading
                    ? "Processando arquivo..."
                    : "Clique para selecionar um arquivo CSV"}
                </p>
                <p className="text-xs text-gray-500">
                  O arquivo deve conter uma coluna de CEPs
                </p>

                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />

                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex items-center gap-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:scale-105 transition shadow-sm rounded-md",
                    isFileLoading && "bg-muted cursor-not-allowed"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  {isFileLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Carregando
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Selecionar CSV
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-0">
          <Card className="border border-slate-300 bg-slate-50 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <div className="space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1 text-gray-600">
                  CEPs (um por linha ou separados por vírgula)
                </label>
                <textarea
                  className="w-full min-h-[140px] p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-300 text-sm placeholder:text-gray-400"
                  placeholder="01001-000&#10;02002-000&#10;03003-000"
                  value={manualCeps}
                  onChange={(e) => setManualCeps(e.target.value)}
                />

                <Button
                  onClick={processManualCeps}
                  disabled={!manualCeps.trim()}
                  size="sm"
                  className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white flex items-center justify-center gap-2 shadow-md hover:scale-105 transition rounded-xl py-2"
                >
                  Validar CEPs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
