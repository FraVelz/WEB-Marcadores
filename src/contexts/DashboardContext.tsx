"use client";

import { createContext, useContext, useRef, useCallback, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type DashboardContextType = {
  filterRef: React.RefObject<HTMLInputElement | null>;
  searchRef: React.RefObject<HTMLInputElement | null>;
  mainRef: React.RefObject<HTMLElement | null>;
  focusMain: () => void;
  filterValue: string;
  setFilterValue: (v: string) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
  allTags: string[];
  refreshTags: () => void;
  setMainKeyDown: (handler: ((e: React.KeyboardEvent) => void) | null) => void;
  mainKeyDownRef: React.MutableRefObject<((e: React.KeyboardEvent) => void) | null>;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const filterRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [filterValue, setFilterValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const mainKeyDownRef = useRef<((e: React.KeyboardEvent) => void) | null>(null);

  const refreshTags = useCallback(async () => {
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
        allTags,
        refreshTags,
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
