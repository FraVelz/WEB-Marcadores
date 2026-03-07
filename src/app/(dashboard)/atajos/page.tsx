export default function AtajosPage() {
  const shortcuts = [
    { keys: "Ctrl+1", desc: "Ir a Marcadores" },
    { keys: "Ctrl+2", desc: "Ir a Atajos" },
    { keys: "Ctrl+3", desc: "Ir a Perfil" },
    { keys: "Vista: Grilla", desc: "Marcadores en grid con tags" },
    { keys: "Vista: Tema › Subtema", desc: "Marcadores agrupados por tema y subtema (vista por defecto)" },
    { keys: "Ctrl+F", desc: "Enfocar input de filtro por nombre" },
    { keys: "Ctrl+K", desc: "Enfocar input de búsqueda por tags" },
    { keys: "Ctrl+N", desc: "Enfocar grid de marcadores (navegación vim)" },
    { keys: "Tab / Shift+Tab", desc: "Navegar opciones en autocompletado de tags" },
    { keys: "↑ / ↓", desc: "Navegar opciones en autocompletado de tags" },
    { keys: "Enter (en input tags)", desc: "Seleccionar tag y enfocar grid" },
    { keys: "Enter (en input nombre)", desc: "Enfocar el grid de marcadores" },
    { keys: "k", desc: "Marcador de arriba" },
    { keys: "j", desc: "Marcador de abajo" },
    { keys: "h", desc: "Marcador a la izquierda" },
    { keys: "l", desc: "Marcador a la derecha" },
    { keys: "Enter", desc: "Abrir marcador seleccionado" },
    { keys: "i", desc: "Ver detalle del marcador seleccionado" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Atajos</h1>
      <div className="space-y-3">
        {shortcuts.map((s, i) => (
          <div
            key={`${s.keys}-${i}`}
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
