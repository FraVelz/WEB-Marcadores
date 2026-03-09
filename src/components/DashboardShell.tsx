"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/contexts/DashboardContext";
import type { Folder } from "@/contexts/DashboardContext";
import ExplorerTree from "@/components/ExplorerTree";

function findFolderInTree(folders: Folder[], id: string): Folder | undefined {
  for (const f of folders) {
    if (f.id === id) return f;
    if (f.children) {
      const found = findFolderInTree(f.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function folderHasChildren(folders: Folder[], id: string): boolean {
  const f = findFolderInTree(folders, id);
  return !!(f?.children?.length);
}

function flattenTree(folders: Folder[], collapsedIds: Set<string>): (string | null)[] {
  const result: (string | null)[] = [null];
  const add = (items: Folder[]) => {
    for (const f of items) {
      result.push(f.id);
      if (f.children && f.children.length > 0 && !collapsedIds.has(f.id)) {
        add(f.children);
      }
    }
  };
  add(folders);
  return result;
}

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
    sidebarRef,
    focusMain,
    focusSidebar,
    mainKeyDownRef,
    selectedFolderId,
    setSelectedFolderId,
    folders,
  } = useDashboard();
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const flatSidebarItems = useMemo(
    () => flattenTree(folders, collapsedIds),
    [folders, collapsedIds]
  );

  useEffect(() => {
    if (pathname === "/marcadores") {
      requestAnimationFrame(() => mainRef.current?.focus());
    }
  }, [pathname, mainRef]);

  const handleSidebarKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "n" && !e.ctrlKey) {
        e.preventDefault();
        focusMain();
        return;
      }
      const idx = flatSidebarItems.indexOf(selectedFolderId);
      const currentIdx = idx >= 0 ? idx : 0;
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        const nextIdx = Math.min(currentIdx + 1, flatSidebarItems.length - 1);
        setSelectedFolderId(flatSidebarItems[nextIdx]);
        return;
      }
      if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        const prevIdx = Math.max(currentIdx - 1, 0);
        setSelectedFolderId(flatSidebarItems[prevIdx]);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const id = flatSidebarItems[currentIdx];
        if (id) {
          const folder = folders.find((f) => f.id === id) ?? findFolderInTree(folders, id);
          if (folder?.children?.length) {
            setCollapsedIds((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            });
          }
        }
        setSelectedFolderId(flatSidebarItems[currentIdx]);
        focusMain();
        return;
      }
      if (e.key === "h" || e.key === "ArrowLeft") {
        e.preventDefault();
        const id = flatSidebarItems[currentIdx];
        if (id && collapsedIds.has(id)) return;
        if (id) {
          setCollapsedIds((prev) => new Set(prev).add(id));
        }
        return;
      }
      if (e.key === "l" || e.key === "ArrowRight") {
        e.preventDefault();
        const id = flatSidebarItems[currentIdx];
        if (id && folderHasChildren(folders, id)) {
          setCollapsedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
        return;
      }
    },
    [
      flatSidebarItems,
      selectedFolderId,
      setSelectedFolderId,
      folders,
      collapsedIds,
      focusMain,
    ]
  );

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
      if (e.key === "n" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const active = document.activeElement;
        if (active?.tagName === "INPUT" || active?.tagName === "TEXTAREA" || (active as HTMLElement).closest?.('[role="dialog"]')) return;
        e.preventDefault();
        if (pathname === "/marcadores") {
          const isSidebarFocused = sidebarRef.current?.contains(active);
          if (isSidebarFocused) focusMain();
          else focusSidebar();
        } else {
          focusMain();
        }
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
  }, [pathname, focusMain, focusSidebar, sidebarRef, router]);

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
          <div
            ref={sidebarRef}
            tabIndex={0}
            className="flex-1 overflow-y-auto p-2 outline-none focus:ring-0"
            onKeyDown={handleSidebarKeyDown}
          >
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
