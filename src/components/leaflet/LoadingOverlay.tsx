export default function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 rounded-full border border-muted animate-spin" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  )
}
