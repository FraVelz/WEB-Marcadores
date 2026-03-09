"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/contexts/DashboardContext";
import ExplorerTree from "@/components/ExplorerTree";

const navItems = [
  { href: "/marcadores", label: "Marcadores" },
  { href: "/atajos", label: "Atajos" },
  { href: "/perfil", label: "Perfil" },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    mainRef,
    focusMain,
    mainKeyDownRef,
    selectedFolderId,
    setSelectedFolderId,
    folders,
  } = useDashboard();
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggleCollapsed = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        focusMain();
      }
      if (e.ctrlKey && /^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < navItems.length) {
          e.preventDefault();
          router.push(navItems[idx].href);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusMain, router]);

  return (
    <div className="flex min-h-screen bg-[#1e1e1e]">
      {/* Panel izquierdo - Árbol de carpetas (estilo Explorer) */}
      <aside className="flex h-screen w-56 flex-col border-r border-zinc-700 bg-[#252526]">
        <div className="border-b border-zinc-700 px-3 py-2">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Explorador
          </span>
        </div>
        <nav className="flex flex-col gap-0.5 border-b border-zinc-700 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-zinc-600/80 text-white"
                  : "text-zinc-300 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              <svg
                className="h-4 w-4 flex-shrink-0 text-zinc-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>
        {pathname === "/marcadores" && (
          <div className="flex-1 overflow-y-auto p-2">
            <ExplorerTree
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelect={setSelectedFolderId}
              collapsedIds={collapsedIds}
              onToggle={toggleCollapsed}
            />
          </div>
        )}
      </aside>
      {/* Área principal */}
      <main
        ref={mainRef}
        tabIndex={0}
        className="flex flex-1 flex-col overflow-hidden bg-[#1e1e1e] outline-none focus:ring-0"
        onKeyDown={(e) => mainKeyDownRef.current?.(e)}
      >
        {children}
      </main>
    </div>
  );
}
