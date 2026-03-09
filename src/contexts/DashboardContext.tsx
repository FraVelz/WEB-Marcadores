"use client";

import { createContext, useContext, useRef, useCallback, useState, useEffect } from "react";
import { createClient, isDemoMode } from "@/lib/supabase/client";
import { DEMO_TAGS } from "@/lib/demo-data";

export type ViewMode = "grid" | "hierarchical";

export type Folder = {
  id: string;
  parent_id: string | null;
  name: string;
  sort_order: number;
  children?: Folder[];
};

type DashboardContextType = {
  filterRef: React.RefObject<HTMLInputElement | null>;
  searchRef: React.RefObject<HTMLInputElement | null>;
  mainRef: React.RefObject<HTMLElement | null>;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
  focusMain: () => void;
  focusSidebar: () => void;
  filterValue: string;
  setFilterValue: (v: string) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
  allTags: string[];
  refreshTags: () => void;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  setMainKeyDown: (handler: ((e: React.KeyboardEvent) => void) | null) => void;
  mainKeyDownRef: React.MutableRefObject<((e: React.KeyboardEvent) => void) | null>;
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  folders: Folder[];
  setFolders: (folders: Folder[]) => void;
  refreshFolders: () => void;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const filterRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [filterValue, setFilterValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("hierarchical");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const mainKeyDownRef = useRef<((e: React.KeyboardEvent) => void) | null>(null);

  const refreshTags = useCallback(async () => {
    if (isDemoMode()) {
      setAllTags(DEMO_TAGS);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.from("bookmarks").select("tags");
    const tags = new Set<string>();
    for (const row of data || []) {
      for (const t of row.tags || []) {
        if (t?.trim()) tags.add(t.trim());
      }
    }
    setAllTags(Array.from(tags).sort());
  }, []);

  const refreshFolders = useCallback(async () => {
    if (isDemoMode()) return;
    const supabase = createClient();
    const { data } = await supabase.from("folders").select("*").order("sort_order");
    if (!data) return;
    const byParent: Record<string, Folder[]> = {};
    for (const f of data) {
      const pid = f.parent_id || "root";
      if (!byParent[pid]) byParent[pid] = [];
      byParent[pid].push({ ...f, children: [] });
    }
    const buildTree = (parentId: string): Folder[] => {
      const list = byParent[parentId] || [];
      return list
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((f) => ({ ...f, children: buildTree(f.id) }));
    };
    setFolders(buildTree("root"));
  }, []);

  useEffect(() => {
    refreshTags();
  }, [refreshTags]);

  useEffect(() => {
    refreshFolders();
  }, [refreshFolders]);

  const setMainKeyDown = useCallback((handler: ((e: React.KeyboardEvent) => void) | null) => {
    mainKeyDownRef.current = handler;
  }, []);

  const focusMain = useCallback(() => {
    mainRef.current?.focus();
  }, []);

  const focusSidebar = useCallback(() => {
    sidebarRef.current?.focus();
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        filterRef,
        searchRef,
        mainRef,
        sidebarRef,
        focusMain,
        focusSidebar,
        filterValue,
        setFilterValue,
        searchValue,
        setSearchValue,
        allTags,
        refreshTags,
        viewMode,
        setViewMode,
        setMainKeyDown,
        mainKeyDownRef,
        selectedFolderId,
        setSelectedFolderId,
        folders,
        setFolders,
        refreshFolders,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
