export default function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-muted/30 rounded-md">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="text-muted-foreground">Carregando mapa...</p>
      </div>
    </div>
  );
}
