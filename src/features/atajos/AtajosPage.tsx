import { shortcuts } from "./data"

export function AtajosPage() {
  return (
    <div className="overflow-auto p-6">
      <h1 className="text-app-fg mb-6 text-2xl font-bold">Atajos</h1>
      <div className="space-y-3">
        {shortcuts.map((s, i) => (
          <div
            key={`${s.keys}-${i}`}
            className="border-app-border-muted bg-app-raised flex items-center gap-4 rounded-lg border p-3"
          >
            <kbd className="bg-app-kbd-bg text-app-fg rounded px-2 py-1 font-mono text-sm">{s.keys}</kbd>
            <span className="text-app-fg-secondary">{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
