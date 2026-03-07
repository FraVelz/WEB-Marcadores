"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createClient, isDemoMode } from "@/lib/supabase/client";
import { DEMO_BOOKMARKS } from "@/lib/demo-data";
import { useDashboard } from "@/contexts/DashboardContext";
import BookmarkModal, { type BookmarkFormData } from "@/components/BookmarkModal";
import BookmarkDetailPanel from "@/components/BookmarkDetailPanel";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  description?: string;
  notes?: string;
  theme?: string;
  subtheme?: string;
  tags?: string[];
  favicon?: string;
  color?: string;
  created_at?: string;
};

export default function MarcadoresPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [detailBookmark, setDetailBookmark] = useState<Bookmark | null>(null);
  const itemRefs = useRef<Map<number, HTMLAnchorElement | HTMLDivElement>>(new Map());
  const supabase = createClient();
  const { filterValue, searchValue, themeFilter, setMainKeyDown, allTags, allThemes, allSubthemes, refreshTags, viewMode } = useDashboard();

  const fetchBookmarks = useCallback(async () => {
    if (isDemoMode()) {
      setBookmarks(DEMO_BOOKMARKS as Bookmark[]);
    } else {
      const { data, error } = await supabase.from("bookmarks").select("*").order("title");
      if (!error) setBookmarks(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const filtered = useMemo(() => {
    let list = bookmarks;
    const f = filterValue.trim().toLowerCase();
    const s = searchValue.trim().toLowerCase();
    const t = themeFilter.trim();
    if (f) list = list.filter((b) => b.title.toLowerCase().includes(f));
    if (s) list = list.filter((b) => b.tags && b.tags.some((tag) => tag.toLowerCase().includes(s)));
    if (t) list = list.filter((b) => (b.theme || "").toLowerCase() === t.toLowerCase());
    return list;
  }, [bookmarks, filterValue, searchValue, themeFilter]);

  const byTag = useMemo(() => {
    const acc: Record<string, Bookmark[]> = {};
    for (const b of filtered) {
      const tags = b.tags?.length ? [...b.tags].sort() : ["sin etiqueta"];
      const primaryTag = tags[0];
      (acc[primaryTag] = acc[primaryTag] || []).push(b);
    }
    for (const tag of Object.keys(acc)) {
      acc[tag].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }
    return acc;
  }, [filtered]);

  const byThemeSubtheme = useMemo(() => {
    const acc: Record<string, Record<string, Bookmark[]>> = {};
    for (const b of filtered) {
      const theme = b.theme?.trim() || "Sin tema";
      const subtheme = b.subtheme?.trim() || "Sin subtema";
      if (!acc[theme]) acc[theme] = {};
      if (!acc[theme][subtheme]) acc[theme][subtheme] = [];
      acc[theme][subtheme].push(b);
    }
    for (const theme of Object.keys(acc)) {
      for (const sub of Object.keys(acc[theme])) {
        acc[theme][sub].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      }
    }
    return acc;
  }, [filtered]);

  const flatList = useMemo(() => {
    if (viewMode === "grid") return filtered;
    if (viewMode === "hierarchical") {
      return Object.entries(byThemeSubtheme).flatMap(([, subs]) =>
        Object.entries(subs).flatMap(([, items]) => items)
      );
    }
    return Object.entries(byTag).flatMap(([, items]) => items);
  }, [filtered, byTag, byThemeSubtheme, viewMode]);
  const totalCount = flatList.length;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (totalCount === 0) return;
      if (selectMode) {
        if (e.key === "Enter") {
          e.preventDefault();
          const item = flatList[selectedIndex];
          if (item) {
            setSelectedIds((prev) => {
              const next = new Set(prev);
              if (next.has(item.id)) next.delete(item.id);
              else next.add(item.id);
              return next;
            });
          }
          return;
        }
      } else {
        if (e.key === "Enter") {
          e.preventDefault();
          const item = flatList[selectedIndex];
          if (item) window.open(item.url, "_blank");
          return;
        }
        if (e.key === "i" || e.key === "I") {
          e.preventDefault();
          const item = flatList[selectedIndex];
          if (item) setDetailBookmark(item);
          return;
        }
      }
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % totalCount);
        return;
      }
      if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + totalCount) % totalCount);
        return;
      }
      if (e.key === "ArrowRight" || e.key === "l") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 3, totalCount - 1));
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "h") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 3, 0));
        return;
      }
    },
    [selectedIndex, totalCount, flatList, selectMode]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filterValue, searchValue, viewMode]);

  useEffect(() => {
    itemRefs.current.get(selectedIndex)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  useEffect(() => {
    setMainKeyDown(handleKeyDown);
    return () => setMainKeyDown(null);
  }, [setMainKeyDown, handleKeyDown]);

  const handleAdd = () => {
    setEditingBookmark(null);
    setModalOpen(true);
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
    if (isDemoMode()) {
      const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
      const theme = data.theme || undefined;
      const subtheme = data.subtheme || undefined;
      if (editingBookmark) {
        setBookmarks((prev) =>
          prev
            .map((b) =>
              b.id === editingBookmark.id
                ? { ...b, title: data.title, url: data.url, description: data.description || undefined, notes: data.notes || undefined, theme, subtheme, tags }
                : b
            )
            .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
        );
        if (detailBookmark?.id === editingBookmark.id) {
          setDetailBookmark((prev) => (prev ? { ...prev, title: data.title, url: data.url, description: data.description || undefined, notes: data.notes || undefined, theme, subtheme, tags } : null));
        }
      } else {
        const newB: Bookmark = {
          id: `demo-${Date.now()}`,
          title: data.title,
          url: data.url,
          description: data.description || undefined,
          notes: data.notes || undefined,
          theme,
          subtheme,
          tags,
          created_at: new Date().toISOString(),
        };
        setBookmarks((prev) => [...prev, newB].sort((a, b) => (a.title || "").localeCompare(b.title || "")));
      }
      refreshTags();
      setEditingBookmark(null);
      setModalOpen(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      title: data.title,
      url: data.url,
      description: data.description || null,
      notes: data.notes || null,
      theme: data.theme || null,
      subtheme: data.subtheme || null,
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      favicon: data.favicon || null,
      color: data.color || null,
    };

    if (editingBookmark) {
      await supabase.from("bookmarks").update(payload).eq("id", editingBookmark.id);
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, ...payload });
    }
    fetchBookmarks();
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
      if (detailBookmark?.id === id) {
        setDetailBookmark((prev) => (prev ? { ...prev, ...updates } : null));
      }
      refreshTags();
      return;
    }
    await supabase.from("bookmarks").update(updates).eq("id", id);
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    if (detailBookmark?.id === id) {
      setDetailBookmark((prev) => (prev ? { ...prev, ...updates } : null));
    }
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

  const getFavicon = (b: Bookmark) => {
    if (b.favicon) return b.favicon;
    try {
      return `https://www.google.com/s2/favicons?domain=${new URL(b.url).hostname}&sz=32`;
    } catch {
      return "";
    }
  };

  const renderBookmarkCard = (
    b: Bookmark,
    currentIdx: number,
    isSelected: boolean,
    isChecked: boolean,
    tags: string[],
    borderColor?: string
  ) => {
    const content = (
      <>
        {selectMode && (
          <div
            className="absolute left-3 top-3 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSelect(b.id);
            }}
          >
            <input
              type="checkbox"
              checked={isChecked}
              readOnly
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
            />
          </div>
        )}
        <div className="flex items-start gap-3">
          {getFavicon(b) && (
            <img
              src={getFavicon(b)}
              alt=""
              className="h-8 w-8 flex-shrink-0 rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <div className="min-w-0 flex-1">
            <span className="font-medium text-white">{b.title}</span>
            {b.description && (
              <p className="mt-1 text-sm text-zinc-400">{b.description}</p>
            )}
            {b.notes && (
              <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{b.notes}</p>
            )}
            {viewMode === "grid" && tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );

    const baseClass = `relative block rounded-lg border p-3 transition-colors ${
      isSelected
        ? "border-blue-500 bg-zinc-800 ring-2 ring-blue-500"
        : "border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800"
    }`;
    const style = borderColor ? { borderLeftWidth: 4, borderLeftColor: borderColor } : undefined;

    if (selectMode) {
      return (
        <div
          key={b.id}
          ref={(el) => {
            if (el) itemRefs.current.set(currentIdx, el);
          }}
          role="button"
          tabIndex={0}
          onClick={() => toggleSelect(b.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleSelect(b.id);
            }
          }}
          className={`${baseClass} cursor-pointer ${selectMode ? "pl-10" : ""}`}
          style={style}
        >
          {content}
        </div>
      );
    }

    return (
      <a
        key={b.id}
        ref={(el) => {
          if (el) itemRefs.current.set(currentIdx, el);
        }}
        href={b.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        className={baseClass}
        style={style}
      >
        {content}
      </a>
    );
  };

  if (loading) return <p className="text-zinc-400">Cargando...</p>;

  return (
    <div className="outline-none">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Marcadores</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAdd}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Agregar
          </button>
          <button
            onClick={() => flatList[selectedIndex] && setDetailBookmark(flatList[selectedIndex])}
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            title="Ver detalle (i)"
          >
            Info
          </button>
          <button
            onClick={() => {
              setSelectMode((m) => !m);
              if (selectMode) setSelectedIds(new Set());
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              selectMode
                ? "bg-zinc-700 text-white"
                : "border border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            Seleccionar
          </button>
          {selectMode && selectedIds.size > 0 && (
            <>
              <button
                onClick={handleEdit}
                disabled={selectedIds.size !== 1}
                className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
              >
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg border border-red-600/50 px-4 py-2 text-sm text-red-400 hover:bg-red-600/20"
              >
                Eliminar ({selectedIds.size})
              </button>
            </>
          )}
        </div>
      </div>

      {viewMode === "hierarchical" ? (
        <div className="space-y-8">
          {Object.entries(byThemeSubtheme).map(([theme, subs]) => (
            <section key={theme}>
              <h2 className="mb-4 border-b border-zinc-700 pb-2 text-lg font-semibold text-zinc-300">
                {theme}
              </h2>
              <div className="space-y-6 pl-2">
                {Object.entries(subs).map(([subtheme, items]) => (
                  <div key={`${theme}-${subtheme}`}>
                    <h3 className="mb-2 text-sm font-medium text-zinc-500">{subtheme}</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((b) => {
                        const currentIdx = flatList.findIndex((x) => x.id === b.id);
                        const isSelected = currentIdx === selectedIndex;
                        const isChecked = selectedIds.has(b.id);
                        const tags = b.tags?.length ? b.tags : [];
                        const borderColor = b.color || undefined;
                        return renderBookmarkCard(b, currentIdx, isSelected, isChecked, tags, borderColor);
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flatList.map((b, currentIdx) =>
          renderBookmarkCard(
            b,
            currentIdx,
            currentIdx === selectedIndex,
            selectedIds.has(b.id),
            b.tags?.length ? b.tags : [],
            b.color
          )
        )}
      </div>
      )}

      <BookmarkDetailPanel
        bookmark={detailBookmark}
        onClose={() => setDetailBookmark(null)}
        onUpdate={handleBookmarkUpdate}
        allTags={allTags}
        allThemes={allThemes}
        allSubthemes={allSubthemes}
      />

      <BookmarkModal
        key={editingBookmark?.id ?? "new"}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBookmark(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={
          editingBookmark
            ? {
                title: editingBookmark.title,
                url: editingBookmark.url,
                description: editingBookmark.description || "",
                notes: editingBookmark.notes || "",
                theme: editingBookmark.theme || "",
                subtheme: editingBookmark.subtheme || "",
                tags: editingBookmark.tags?.join(", ") || "",
                favicon: editingBookmark.favicon || "",
                color: editingBookmark.color || "",
              }
            : null
        }
        allTags={allTags}
        allThemes={allThemes}
        allSubthemes={allSubthemes}
      />
    </div>
  );
}
