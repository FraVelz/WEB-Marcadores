export default function AtajosPage() {
  const shortcuts = [
    { keys: "Ctrl+1", desc: "Ir a Marcadores" },
    { keys: "Ctrl+2", desc: "Ir a Atajos" },
    { keys: "Ctrl+3", desc: "Ir a Perfil" },
    { keys: "n", desc: "Enfocar sidebar / marcadores (alternar)" },
    { keys: "j / k (sidebar)", desc: "Navegar carpetas arriba/abajo" },
    { keys: "h / l (sidebar)", desc: "Colapsar / expandir carpeta" },
    { keys: "Enter (sidebar)", desc: "Abrir carpeta y ver enlaces" },
    { keys: "↑ / k", desc: "Marcador anterior" },
    { keys: "↓ / j", desc: "Marcador siguiente" },
    { keys: "Enter", desc: "Abrir enlace o entrar en carpeta" },
    { keys: "z", desc: "Subir una carpeta (volver atrás en la jerarquía)" },
    { keys: "a", desc: "Crear nuevo enlace" },
    { keys: "Ctrl+A", desc: "Crear nueva carpeta" },
    { keys: "Ctrl+X", desc: "Cortar carpeta o enlace (mover)" },
    { keys: "Ctrl+V", desc: "Pegar en la carpeta actual" },
    { keys: "r", desc: "Modificar enlace o renombrar carpeta (marcadores y sidebar)" },
    { keys: "i", desc: "Ver propiedades del marcador" },
    { keys: "Doble clic", desc: "Abrir marcador en nueva pestaña" },
  ];

  return (
    <div className="overflow-auto p-6">
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
