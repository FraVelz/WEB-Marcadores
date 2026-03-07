"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/contexts/DashboardContext";
import TagAutocomplete from "@/components/TagAutocomplete";

const navItems = [
  { href: "/marcadores", label: "Marcadores" },
  { href: "/atajos", label: "Atajos" },
  { href: "/perfil", label: "Perfil" },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { filterRef, searchRef, mainRef, focusMain, filterValue, setFilterValue, searchValue, setSearchValue, themeFilter, setThemeFilter, allTags, allThemes, viewMode, setViewMode, mainKeyDownRef } = useDashboard();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        filterRef.current?.focus();
      }
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
  }, [filterRef, searchRef, focusMain, router]);

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <aside className="top-0 h-screen flex w-64 flex-col border-r border-zinc-800 bg-zinc-900 p-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Filtrar por nombre (Ctrl+F)</label>
            <input
              ref={filterRef}
              type="text"
              placeholder="Nombre del marcador..."
              data-no-vim
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  focusMain();
                }
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              Buscar por tags (Ctrl+K) — Tab: navegar, Enter: seleccionar
            </label>
            <TagAutocomplete
              inputRef={searchRef}
              value={searchValue}
              onChange={setSearchValue}
              options={allTags}
              onEnter={focusMain}
              placeholder="Etiqueta..."
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          {pathname === "/marcadores" && (
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Filtrar por tema</label>
              <select
                value={themeFilter}
                onChange={(e) => setThemeFilter(e.target.value)}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Todos los temas</option>
                {allThemes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
          {pathname === "/marcadores" && (
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Vista</label>
              <div className="flex gap-1 rounded-lg border border-zinc-600 bg-zinc-800 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex-1 rounded px-2 py-1.5 text-xs transition-colors ${
                    viewMode === "grid" ? "bg-zinc-600 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Grilla
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("hierarchical")}
                  className={`flex-1 rounded px-2 py-1.5 text-xs transition-colors ${
                    viewMode === "hierarchical" ? "bg-zinc-600 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Tema › Subtema
                </button>
              </div>
            </div>
          )}
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          Ctrl+1/2/3: secciones | Ctrl+F: filtro | Ctrl+K: tags | Ctrl+N: foco grid | hjkl: navegar
        </p>
      </aside>
      <main
        ref={mainRef}
        tabIndex={0}
        className="flex-1 overflow-auto p-6 outline-none focus:ring-0"
        onKeyDown={(e) => mainKeyDownRef.current?.(e)}
      >
        {children}
      </main>
    </div>
  );
}
