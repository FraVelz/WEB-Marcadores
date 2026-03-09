"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createClient, isDemoMode } from "@/lib/supabase/client";
import { DEMO_BOOKMARKS, DEMO_FOLDERS } from "@/lib/demo-data";
import { useDashboard } from "@/contexts/DashboardContext";
import BookmarkModal, { type BookmarkFormData } from "@/components/BookmarkModal";
import BookmarkDetailPanel from "@/components/BookmarkDetailPanel";
import TagAutocomplete from "@/components/TagAutocomplete";
import type { Folder } from "@/contexts/DashboardContext";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  description?: string;
  folder_id?: string | null;
  tags?: string[];
  created_at?: string;
};

function buildFolderTree(folders: { id: string; parent_id: string | null; name: string; sort_order: number }[]): Folder[] {
  const byParent: Record<string, Folder[]> = {};
  for (const f of folders) {
    const pid = f.parent_id || "root";
    if (!byParent[pid]) byParent[pid] = [];
    byParent[pid].push({ ...f, children: [] });
  }
  const build = (parentId: string): Folder[] =>
    (byParent[parentId] || []).sort((a, b) => a.sort_order - b.sort_order).map((f) => ({ ...f, children: build(f.id) }));
  return build("root");
}

export default function MarcadoresPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<{ id: string; parent_id: string | null; name: string; sort_order: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [detailBookmark, setDetailBookmark] = useState<Bookmark | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [infoPanelEnabled, setInfoPanelEnabled] = useState(true);
  const [gridCols, setGridCols] = useState(3);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const filterRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const {
    filterValue,
    setFilterValue,
    searchValue,
    setSearchValue,
    selectedFolderId,
    setSelectedFolderId,
    folders: ctxFolders,
    setFolders: setCtxFolders,
    refreshFolders,
    allTags,
    refreshTags,
    setMainKeyDown,
    searchRef,
    focusMain,
  } = useDashboard();

  const fetchData = useCallback(async () => {
    if (isDemoMode()) {
      setBookmarks(DEMO_BOOKMARKS as Bookmark[]);
      setFolders(DEMO_FOLDERS);
      setCtxFolders(buildFolderTree(DEMO_FOLDERS));
    } else {
      const { data: bData } = await supabase.from("bookmarks").select("*").order("title");
      setBookmarks(bData || []);
      const { data: fData } = await supabase.from("folders").select("*").order("sort_order");
      setFolders(fData || []);
      refreshFolders();
    }
    setLoading(false);
  }, [supabase, setCtxFolders, refreshFolders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isDemoMode()) {
      setCtxFolders(buildFolderTree(folders));
    }
  }, [folders, isDemoMode, setCtxFolders]);

  const filteredBookmarks = useMemo(() => {
    let list = bookmarks;
    const f = filterValue.trim().toLowerCase();
    const s = searchValue.trim().toLowerCase();
    if (f) list = list.filter((b) => b.title.toLowerCase().includes(f));
    if (s) list = list.filter((b) => b.tags?.some((tag) => tag.toLowerCase().includes(s)));
    return list;
  }, [bookmarks, filterValue, searchValue]);

  type GridItem = { type: "folder"; id: string; folderId: string; label: string } | { type: "link"; bookmark: Bookmark };
  const flatList = useMemo((): GridItem[] => {
    const parentId = selectedFolderId;
    const subfolders = folders
      .filter((f) => (f.parent_id || null) === parentId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((f) => ({ type: "folder" as const, id: f.id, folderId: f.id, label: f.name }));
    const links = filteredBookmarks
      .filter((b) => (b.folder_id || null) === parentId)
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
      .map((b) => ({ type: "link" as const, bookmark: b }));
    return [...subfolders, ...links];
  }, [filteredBookmarks, folders, selectedFolderId]);
  const totalCount = flatList.length;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || (active as HTMLElement).closest?.('[role="dialog"]'))) return;
      if (totalCount === 0) return;
      const item = flatList[selectedIndex];
      if (selectMode && item?.type === "link") {
        if (e.key === "Enter") {
          e.preventDefault();
          setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(item.bookmark.id)) next.delete(item.bookmark.id);
            else next.add(item.bookmark.id);
            return next;
          });
          return;
        }
      } else if (item) {
        if (e.key === "Enter") {
          e.preventDefault();
          if (item.type === "folder") setSelectedFolderId(item.folderId);
          else window.open(item.bookmark.url, "_blank");
          return;
        }
        if ((e.key === "i" || e.key === "I") && item.type === "link") {
          e.preventDefault();
          setInfoPanelEnabled((prev) => {
            const next = !prev;
            if (next) setDetailBookmark(item.bookmark);
            else setDetailBookmark(null);
            return next;
          });
          return;
        }
      }
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + gridCols, totalCount - 1));
        return;
      }
      if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - gridCols, 0));
        return;
      }
      if (e.key === "l" || e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, totalCount - 1));
        return;
      }
      if (e.key === "h" || e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
    },
    [selectedIndex, totalCount, flatList, selectMode, gridCols, setSelectedFolderId]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filterValue, searchValue, selectedFolderId]);

  useEffect(() => {
    itemRefs.current.get(selectedIndex)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  useEffect(() => {
    const w = window.innerWidth;
    setGridCols(w >= 1280 ? 4 : w >= 1024 ? 3 : w >= 640 ? 2 : 1);
  }, []);
  useEffect(() => {
    const h = () => setGridCols(window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    const item = flatList[selectedIndex];
    if (infoPanelEnabled) setDetailBookmark(item?.type === "link" ? item.bookmark : null);
    else setDetailBookmark(null);
  }, [flatList, selectedIndex, infoPanelEnabled]);

  useEffect(() => {
    if (modalOpen) setMainKeyDown(null);
    else setMainKeyDown(handleKeyDown);
    return () => setMainKeyDown(null);
  }, [setMainKeyDown, handleKeyDown, modalOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => filterRef.current?.focus(), 0);
      }
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchRef.current?.focus(), 0);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [searchRef]);

  const handleAdd = () => {
    setEditingBookmark(null);
    setModalOpen(true);
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    if (isDemoMode()) {
      const id = `f-${Date.now()}`;
      setFolders((prev) => [...prev, { id, parent_id: selectedFolderId, name, sort_order: prev.length }]);
      setCtxFolders(buildFolderTree([...folders, { id, parent_id: selectedFolderId, name, sort_order: folders.length }]));
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("folders").insert({ user_id: user.id, parent_id: selectedFolderId, name, sort_order: folders.length }).select().single();
      if (!error && data) {
        setFolders((prev) => [...prev, data]);
        refreshFolders();
      }
    }
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const handleEdit = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 1) {
      const b = bookmarks.find((x) => x.id === ids[0]);
      if (b) {
        setEditingBookmark(b);
        setModalOpen(true);
      }
    }
  };

  const handleModalSubmit = async (data: BookmarkFormData) => {
    const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const folder_id = data.folder_id || null;

    if (isDemoMode()) {
      if (editingBookmark) {
        setBookmarks((prev) =>
          prev.map((b) =>
            b.id === editingBookmark.id ? { ...b, title: data.title, url: data.url, description: data.description || undefined, folder_id, tags } : b
          )
        );
        if (detailBookmark?.id === editingBookmark.id) setDetailBookmark((prev) => (prev ? { ...prev, title: data.title, url: data.url, description: data.description, folder_id, tags } : null));
      } else {
        setBookmarks((prev) => [
          ...prev,
          {
            id: `demo-${Date.now()}`,
            title: data.title,
            url: data.url,
            description: data.description || undefined,
            folder_id,
            tags,
            created_at: new Date().toISOString(),
          },
        ]);
      }
      refreshTags();
      setEditingBookmark(null);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Debes iniciar sesión");

    const payload = {
      title: data.title,
      url: data.url,
      description: data.description || null,
      folder_id,
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };

    if (editingBookmark) {
      await supabase.from("bookmarks").update(payload).eq("id", editingBookmark.id);
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, ...payload });
    }
    await fetchData();
    refreshTags();
    setEditingBookmark(null);
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    if (isDemoMode()) {
      setBookmarks((prev) => prev.filter((b) => !selectedIds.has(b.id)));
      setSelectedIds(new Set());
      setSelectMode(false);
      return;
    }
    await supabase.from("bookmarks").delete().in("id", Array.from(selectedIds));
    setBookmarks((prev) => prev.filter((b) => !selectedIds.has(b.id)));
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const handleBookmarkUpdate = async (id: string, updates: Partial<Bookmark>) => {
    if (isDemoMode()) {
      setBookmarks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
      if (detailBookmark?.id === id) setDetailBookmark((prev) => (prev ? { ...prev, ...updates } : null));
      refreshTags();
      return;
    }
    await supabase.from("bookmarks").update(updates).eq("id", id);
    setBookmarks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    if (detailBookmark?.id === id) setDetailBookmark((prev) => (prev ? { ...prev, ...updates } : null));
    refreshTags();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getFavicon = (url: string) => {
    try {
      return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
    } catch {
      return "";
    }
  };

  const getFolderPath = useCallback(() => {
    const path: { id: string | null; label: string }[] = [{ id: null, label: "Marcadores" }];
    if (!selectedFolderId) return path;
    let current: { id: string; parent_id: string | null; name: string } | undefined = folders.find((f) => f.id === selectedFolderId);
    const chain: { id: string; label: string }[] = [];
    while (current) {
      chain.unshift({ id: current.id, label: current.name });
      current = current.parent_id ? folders.find((f) => f.id === current!.parent_id) : undefined;
    }
    return [...path, ...chain];
  }, [folders, selectedFolderId]);

  const breadcrumb = getFolderPath();

  if (loading) return <div className="flex flex-1 items-center justify-center text-zinc-500">Cargando...</div>;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-1 border-b border-zinc-700 bg-[#2d2d30] px-2 py-1">
        <button type="button" onClick={() => setSelectedFolderId(null)} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-600 hover:text-white" title="Subir">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
          </svg>
        </button>
        <div className="mx-1 h-5 w-px bg-zinc-600" />
        <button type="button" onClick={handleAdd} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-600 hover:text-white" title="Nuevo marcador">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setShowNewFolder(true)}
          className="rounded p-1.5 text-zinc-400 hover:bg-zinc-600 hover:text-white"
          title="Nueva carpeta"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            const item = flatList[selectedIndex];
            setInfoPanelEnabled((prev) => {
              const next = !prev;
              if (next && item?.type === "link") setDetailBookmark(item.bookmark);
              else setDetailBookmark(null);
              return next;
            });
          }}
          className={`rounded p-1.5 ${infoPanelEnabled ? "bg-zinc-600 text-white" : "text-zinc-400 hover:bg-zinc-600 hover:text-white"}`}
          title="Modo información (i)"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        </button>
        <div className="mx-1 h-5 w-px bg-zinc-600" />
        <button
          type="button"
          onClick={() => setShowSearch((s) => !s)}
          className={`rounded p-1.5 ${showSearch ? "bg-zinc-600 text-white" : "text-zinc-400 hover:bg-zinc-600 hover:text-white"}`}
          title="Buscar (Ctrl+F)"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </button>
        {showSearch && (
          <div className="ml-2 flex flex-1 items-center gap-2">
            <input
              ref={filterRef}
              type="text"
              placeholder="Buscar por nombre..."
              data-no-vim
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="flex-1 rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
            <TagAutocomplete
              inputRef={searchRef}
              value={searchValue}
              onChange={setSearchValue}
              options={allTags}
              onEnter={focusMain}
              placeholder="Tags..."
              className="w-32 rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}
        {showNewFolder && (
          <div className="ml-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Nombre de carpeta"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") setShowNewFolder(false);
              }}
              className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <button onClick={handleCreateFolder} className="rounded bg-blue-600 px-2 py-1 text-sm text-white hover:bg-blue-700">
              Crear
            </button>
            <button onClick={() => setShowNewFolder(false)} className="rounded px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-600">
              Cancelar
            </button>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => {
              setSelectMode((m) => !m);
              if (selectMode) setSelectedIds(new Set());
            }}
            className={`rounded px-2 py-1 text-xs ${selectMode ? "bg-zinc-600 text-white" : "text-zinc-400 hover:bg-zinc-600 hover:text-white"}`}
          >
            Seleccionar
          </button>
          {selectMode && selectedIds.size > 0 && (
            <>
              <button onClick={handleEdit} disabled={selectedIds.size !== 1} className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-600 hover:text-white disabled:opacity-50">
                Editar
              </button>
              <button onClick={handleDelete} className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-600/20">
                Eliminar ({selectedIds.size})
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-zinc-700 bg-[#252526] px-3 py-1.5">
        {breadcrumb.map((part, i) => (
          <span key={part.id ?? "root"} className="flex items-center gap-1">
            {i > 0 && <span className="text-zinc-600">›</span>}
            <button
              type="button"
              onClick={() => setSelectedFolderId(part.id)}
              className="rounded px-1.5 py-0.5 text-sm text-zinc-300 hover:bg-zinc-600 hover:text-white"
            >
              {part.label}
            </button>
          </span>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {flatList.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const isFolder = item.type === "folder";
              const isChecked = !isFolder && selectedIds.has(item.bookmark.id);
              const baseClass = `relative flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                isSelected ? "border-blue-500 bg-blue-600/20 ring-2 ring-blue-500" : "border-zinc-800 bg-zinc-900/80 hover:border-zinc-600 hover:bg-zinc-800/50"
              } ${selectMode && !isFolder ? "cursor-pointer" : ""}`;
              return (
                <div
                  key={isFolder ? item.id : item.bookmark.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(idx, el);
                  }}
                  className={baseClass}
                  onClick={() => {
                    if (selectMode && !isFolder) toggleSelect(item.bookmark.id);
                    else setSelectedIndex(idx);
                  }}
                  onDoubleClick={() => {
                    if (selectMode) return;
                    if (isFolder) setSelectedFolderId(item.folderId);
                    else window.open(item.bookmark.url, "_blank");
                  }}
                >
                  {selectMode && !isFolder && (
                    <div className="absolute left-3 top-3 z-10" onClick={(e) => { e.stopPropagation(); toggleSelect(item.bookmark.id); }}>
                      <input type="checkbox" checked={isChecked} readOnly className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500" />
                    </div>
                  )}
                  {isFolder ? (
                    <>
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded">
                        <svg className="h-10 w-10 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-white">{item.label}</span>
                        <p className="text-xs text-zinc-500">Carpeta</p>
                      </div>
                    </>
                  ) : (
                    <>
                      {getFavicon(item.bookmark.url) ? (
                        <img src={getFavicon(item.bookmark.url)} alt="" className="h-8 w-8 flex-shrink-0 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-zinc-700">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                          </svg>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-white">{item.bookmark.title}</span>
                        <p className="truncate text-xs text-zinc-500">
                          {(() => {
                            try {
                              return new URL(item.bookmark.url).hostname.replace(/^www\./, "");
                            } catch {
                              return item.bookmark.url;
                            }
                          })()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {flatList.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <svg className="mb-4 h-16 w-16 text-zinc-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              <p className="text-sm">Esta carpeta está vacía</p>
              <button onClick={handleAdd} className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                Agregar marcador
              </button>
              <button onClick={() => setShowNewFolder(true)} className="mt-2 rounded border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
                Nueva carpeta
              </button>
            </div>
          )}
        </div>

        {detailBookmark && (
          <BookmarkDetailPanel
            bookmark={detailBookmark}
            onClose={() => { setDetailBookmark(null); setInfoPanelEnabled(false); }}
            onUpdate={handleBookmarkUpdate}
            allTags={allTags}
            folders={folders}
            embedded
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-700 bg-[#252526] px-3 py-1 text-xs text-zinc-500">
        <span>{flatList.length} elemento{flatList.length !== 1 ? "s" : ""}</span>
        {flatList[selectedIndex]?.type === "link" && (
          <span className="truncate max-w-[400px]">{flatList[selectedIndex].bookmark.url}</span>
        )}
      </div>

      <BookmarkModal
        key={editingBookmark?.id ?? "new"}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingBookmark(null); }}
        onSubmit={handleModalSubmit}
        initialData={
          editingBookmark
            ? {
                title: editingBookmark.title,
                url: editingBookmark.url,
                description: editingBookmark.description || "",
                folder_id: editingBookmark.folder_id || "",
                tags: editingBookmark.tags?.join(", ") || "",
              }
            : null
        }
        allTags={allTags}
        folders={folders}
        currentFolderId={selectedFolderId}
      />
    </div>
  );
}
