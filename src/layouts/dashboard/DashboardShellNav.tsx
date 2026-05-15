import Link from "next/link"

import { navItems } from "./utils"

type DashboardShellNavProps = {
  pathname: string
  onNavigate?: () => void
}

export function DashboardShellNav({ pathname, onNavigate }: DashboardShellNavProps) {
  return (
    <nav className="border-app-border flex flex-col gap-0.5 border-b p-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
            pathname === item.href
              ? "bg-app-nav-active text-app-fg"
              : "text-app-fg-secondary hover:bg-app-hover hover:text-app-fg"
          }`}
        >
          <svg className="text-app-fg-icon size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>

          {item.label}
        </Link>
      ))}
    </nav>
  )
}
