type Props = {
  title: string
  subtitle?: string
}

/** Cabecera ligera para páginas del dashboard (Estadísticas, Atajos, Perfil). */
export function DashboardPageHeader({ title, subtitle }: Props) {
  return (
    <header className="border-app-border bg-app-toolbar shrink-0 border-b px-4 py-5 md:px-6">
      <h1 className="text-app-fg text-xl font-semibold tracking-tight">{title}</h1>
      {subtitle ? <p className="text-app-fg-muted mt-0.5 text-sm">{subtitle}</p> : null}
    </header>
  )
}
