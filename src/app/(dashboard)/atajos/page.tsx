export default function AtajosPage() {
  const shortcuts = [
    { keys: "Ctrl+F", desc: "Enfocar input de filtro por nombre" },
    { keys: "Ctrl+K", desc: "Enfocar input de búsqueda por tags" },
    { keys: "Ctrl+N", desc: "Enfocar grid de marcadores (navegación vim)" },
    { keys: "Enter (en inputs)", desc: "Enfocar el grid de marcadores" },
    { keys: "j / ↓", desc: "Marcador siguiente" },
    { keys: "k / ↑", desc: "Marcador anterior" },
    { keys: "l / →", desc: "Marcador a la derecha" },
    { keys: "h / ←", desc: "Marcador a la izquierda" },
    { keys: "Enter", desc: "Abrir marcador seleccionado" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Atajos</h1>
      <div className="space-y-3">
        {shortcuts.map((s) => (
          <div
            key={s.keys}
            className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-3"
          >
            <kbd className="rounded bg-zinc-700 px-2 py-1 font-mono text-sm text-white">
              {s.keys}
            </kbd>
            <span className="text-zinc-300">{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
