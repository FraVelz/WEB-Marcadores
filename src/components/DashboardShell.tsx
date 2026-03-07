"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/contexts/DashboardContext";

const navItems = [
  { href: "/marcadores", label: "Marcadores" },
  { href: "/atajos", label: "Atajos" },
  { href: "/perfil", label: "Perfil" },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { filterRef, searchRef, mainRef, focusMain, filterValue, setFilterValue, searchValue, setSearchValue, allTags, mainKeyDownRef } = useDashboard();

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
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filterRef, searchRef, focusMain]);

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900 p-4">
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
            <label className="mb-1 block text-xs text-zinc-500">Buscar por tags (Ctrl+K)</label>
            <input
              ref={searchRef}
              type="text"
              placeholder="Etiqueta..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              list="tag-suggestions"
              autoComplete="off"
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  focusMain();
                }
              }}
            />
            <datalist id="tag-suggestions">
              {allTags.map((tag) => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
          </div>
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          Ctrl+F: filtro | Ctrl+K: búsqueda | Ctrl+N: foco grid | Enter: abrir
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
