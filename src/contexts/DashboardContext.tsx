"use client";

import { createContext, useContext, useRef, useCallback, useState, useEffect } from "react";
import { createClient, isDemoMode } from "@/lib/supabase/client";
import { DEMO_TAGS } from "@/lib/demo-data";

export type ViewMode = "grid" | "hierarchical";

type DashboardContextType = {
  filterRef: React.RefObject<HTMLInputElement | null>;
  searchRef: React.RefObject<HTMLInputElement | null>;
  mainRef: React.RefObject<HTMLElement | null>;
  focusMain: () => void;
  filterValue: string;
  setFilterValue: (v: string) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
  themeFilter: string;
  setThemeFilter: (v: string) => void;
  allTags: string[];
  allThemes: string[];
  allSubthemes: string[];
  refreshTags: () => void;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  setMainKeyDown: (handler: ((e: React.KeyboardEvent) => void) | null) => void;
  mainKeyDownRef: React.MutableRefObject<((e: React.KeyboardEvent) => void) | null>;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

const DEMO_THEMES = ["Desarrollo", "Herramientas", "Documentación"];
const DEMO_SUBTHEMES = ["Frontend", "Backend", "Control de versiones", "Web"];

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const filterRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [filterValue, setFilterValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [themeFilter, setThemeFilter] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allThemes, setAllThemes] = useState<string[]>([]);
  const [allSubthemes, setAllSubthemes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const mainKeyDownRef = useRef<((e: React.KeyboardEvent) => void) | null>(null);

  const refreshTags = useCallback(async () => {
    if (isDemoMode()) {
      setAllTags(DEMO_TAGS);
      setAllThemes(DEMO_THEMES);
      setAllSubthemes(DEMO_SUBTHEMES);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.from("bookmarks").select("tags, theme, subtheme");
    const tags = new Set<string>();
    const themes = new Set<string>();
    const subthemes = new Set<string>();
    for (const row of data || []) {
      for (const t of row.tags || []) {
        if (t?.trim()) tags.add(t.trim());
      }
      if (row.theme?.trim()) themes.add(row.theme.trim());
      if (row.subtheme?.trim()) subthemes.add(row.subtheme.trim());
    }
    setAllTags(Array.from(tags).sort());
    setAllThemes(Array.from(themes).sort());
    setAllSubthemes(Array.from(subthemes).sort());
  }, []);

  useEffect(() => {
    refreshTags();
  }, [refreshTags]);
  const setMainKeyDown = useCallback((handler: ((e: React.KeyboardEvent) => void) | null) => {
    mainKeyDownRef.current = handler;
  }, []);

  const focusMain = useCallback(() => {
    mainRef.current?.focus();
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        filterRef,
        searchRef,
        mainRef,
        focusMain,
        filterValue,
        setFilterValue,
        searchValue,
        setSearchValue,
        themeFilter,
        setThemeFilter,
        allTags,
        allThemes,
        allSubthemes,
        refreshTags,
        viewMode,
        setViewMode,
        setMainKeyDown,
        mainKeyDownRef,
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
