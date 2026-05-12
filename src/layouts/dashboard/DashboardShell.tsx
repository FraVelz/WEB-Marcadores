"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"

import { navItems, findFolderInTree, folderHasChildren, flattenTree, mobileTitle } from "./utils"
import { useDashboard, type Folder } from "@/contexts/DashboardContext"

import ExplorerTree from "@/components/ExplorerTree"
import { cn } from "@/lib/utils"

type DashboardMobileLayoutProps = {
  pathname: string
  children: React.ReactNode
  collapsedIds: Set<string>
  toggleCollapsed: (id: string) => void
  sidebarRef: React.RefObject<HTMLDivElement | null>
  folders: Folder[]
  selectedFolderId: string | null
  setSelectedFolderId: (id: string | null) => void
  handleSidebarKeyDown: (e: React.KeyboardEvent) => void
  mainRef: React.RefObject<HTMLElement | null>
  mainKeyDownRef: React.MutableRefObject<((e: React.KeyboardEvent) => void) | null>
}

function DashboardMobileLayout({
  pathname,
  children,
  collapsedIds,
  toggleCollapsed,
  sidebarRef,
  folders,
  selectedFolderId,
  setSelectedFolderId,
  handleSidebarKeyDown,
  mainRef,
  mainKeyDownRef,
}: DashboardMobileLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    if (!mobileSidebarOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileSidebarOpen])

  return (
    <>
      {/* Sombra: solo mientras el drawer móvil está abierto */}
      <button
        type="button"
        aria-hidden={!mobileSidebarOpen}
        className={cn(
          "bg-app-overlay fixed inset-0 z-30 transition-opacity md:hidden",
          mobileSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        tabIndex={-1}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* Panel izquierdo - Árbol de carpetas (estilo Explorer) */}
      <aside
        className={cn(
          "border-app-border bg-app-sidebar flex w-56 flex-col border-r",
          "inset-y-0 left-0",
          "z-40 h-dvh transition-transform duration-200 ease-out md:relative md:z-auto md:h-screen md:translate-x-0",
          mobileSidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:translate-x-0 md:shadow-none"
        )}
      >
        <div className="border-app-border flex items-center justify-between border-b px-3 py-2">
          <span className="text-app-fg-label text-xs font-medium tracking-wider uppercase">Explorador</span>

          <button
            type="button"
            className="text-app-fg-muted hover:bg-app-hover hover:text-app-fg rounded p-1 md:hidden"
            aria-label="Cerrar menú"
            onClick={() => setMobileSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="border-app-border flex flex-col gap-0.5 border-b p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
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

        {pathname === "/marcadores" && (
          <div
            ref={sidebarRef}
            tabIndex={0}
            role="navigation"
            aria-label="Árbol de carpetas"
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

      <div className="flex min-h-0 w-full flex-1 flex-col md:min-h-screen">
        <header className="border-app-border bg-app-toolbar sticky top-0 z-20 flex shrink-0 items-center gap-2 border-b px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:hidden">
          <button
            type="button"
            className="text-app-fg-secondary hover:bg-app-active hover:text-app-fg rounded p-2"
            aria-label="Abrir menú"
            aria-expanded={mobileSidebarOpen}
            onClick={() => setMobileSidebarOpen(true)}
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>

          <span className="text-app-fg truncate text-sm font-medium">{mobileTitle(pathname)}</span>
        </header>

        {/* Área principal */}
        <main
          ref={mainRef}
          tabIndex={0}
          className="bg-app-canvas flex min-h-0 flex-1 flex-col overflow-hidden outline-none focus:ring-0"
          onKeyDown={(e) => mainKeyDownRef.current?.(e)}
        >
          {children}
        </main>
      </div>
    </>
  )
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { push } = useRouter()
  const {
    mainRef,
    sidebarRef,
    focusMain,
    focusSidebar,
    mainKeyDownRef,
    editFolderRef,
    selectedFolderId,
    setSelectedFolderId,
    folders,
  } = useDashboard()
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())

  const flatSidebarItems = useMemo(() => flattenTree(folders, collapsedIds), [folders, collapsedIds])

  useEffect(() => {
    if (pathname === "/marcadores") {
      requestAnimationFrame(() => mainRef.current?.focus())
    }
  }, [pathname, mainRef])

  const handleSidebarKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "n" && !e.ctrlKey) {
        e.preventDefault()
        focusMain()
        return
      }
      const idx = flatSidebarItems.indexOf(selectedFolderId)
      const currentIdx = idx >= 0 ? idx : 0
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault()
        const nextIdx = Math.min(currentIdx + 1, flatSidebarItems.length - 1)
        setSelectedFolderId(flatSidebarItems[nextIdx])
        return
      }
      if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault()
        const prevIdx = Math.max(currentIdx - 1, 0)
        setSelectedFolderId(flatSidebarItems[prevIdx])
        return
      }
      if (e.key === "Enter") {
        e.preventDefault()
        const id = flatSidebarItems[currentIdx]
        if (id) {
          const folder = folders.find((f) => f.id === id) ?? findFolderInTree(folders, id)
          if (folder?.children?.length) {
            setCollapsedIds((prev) => {
              const next = new Set(prev)
              if (next.has(id)) next.delete(id)
              else next.add(id)
              return next
            })
          }
        }
        setSelectedFolderId(flatSidebarItems[currentIdx])
        focusMain()
        return
      }
      if (e.key === "h" || e.key === "ArrowLeft") {
        e.preventDefault()
        const id = flatSidebarItems[currentIdx]
        if (id && collapsedIds.has(id)) return
        if (id) {
          setCollapsedIds((prev) => new Set(prev).add(id))
        }
        return
      }
      if (e.key === "l" || e.key === "ArrowRight") {
        e.preventDefault()
        const id = flatSidebarItems[currentIdx]
        if (id && folderHasChildren(folders, id)) {
          setCollapsedIds((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        }
        return
      }
      if ((e.key === "r" || e.key === "R") && !e.ctrlKey) {
        e.preventDefault()
        const id = flatSidebarItems[currentIdx]
        if (id) {
          const folder = folders.find((f) => f.id === id) ?? findFolderInTree(folders, id)
          if (folder) editFolderRef.current?.(folder.id, folder.name)
        }
        return
      }
    },
    [flatSidebarItems, selectedFolderId, setSelectedFolderId, folders, collapsedIds, focusMain, editFolderRef]
  )

  const toggleCollapsed = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "n" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const active = document.activeElement
        if (
          active?.tagName === "INPUT" ||
          active?.tagName === "TEXTAREA" ||
          (active as HTMLElement).closest?.('[role="dialog"]')
        )
          return
        e.preventDefault()
        if (pathname === "/marcadores") {
          const isSidebarFocused = sidebarRef.current?.contains(active)
          if (isSidebarFocused) focusMain()
          else focusSidebar()
        } else {
          focusMain()
        }
      }
      if (e.ctrlKey && /^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1
        if (idx < navItems.length) {
          e.preventDefault()
          push(navItems[idx].href)
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [pathname, focusMain, focusSidebar, sidebarRef, push])

  return (
    <div className="bg-app-canvas flex min-h-dvh md:min-h-screen">
      <DashboardMobileLayout
        key={pathname}
        pathname={pathname}
        collapsedIds={collapsedIds}
        toggleCollapsed={toggleCollapsed}
        sidebarRef={sidebarRef}
        folders={folders}
        selectedFolderId={selectedFolderId}
        setSelectedFolderId={setSelectedFolderId}
        handleSidebarKeyDown={handleSidebarKeyDown}
        mainRef={mainRef}
        mainKeyDownRef={mainKeyDownRef}
      >
        {children}
      </DashboardMobileLayout>
    </div>
  )
}
