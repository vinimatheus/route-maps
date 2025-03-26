export default function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/60 to-slate-100/60 backdrop-blur-sm rounded-xl z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-transparent border-t-indigo-500 border-l-cyan-400 animate-spin"></div>
        <p className="text-gray-600 text-sm font-medium">Carregando mapa...</p>
      </div>
    </div>
  );
}
