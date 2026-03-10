"use client";

export default function DemoBanner() {
  return (
    <div className="flex items-center justify-center gap-2 border-b border-amber-600/50 bg-amber-900/20 px-3 py-2 text-sm text-amber-200">
      <span className="font-medium">Modo demo</span>
      <span className="text-amber-300/90">— Datos de ejemplo. No son tus marcadores.</span>
    </div>
  );
}
