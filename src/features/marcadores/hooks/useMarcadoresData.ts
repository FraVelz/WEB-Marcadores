"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { createClient, isDemoMode } from "@/lib/supabase/client";
import { DEMO_BOOKMARKS, DEMO_FOLDERS } from "@/lib/demo-data";
import { buildFolderTree, getFolderPath } from "../utils";
import type { Bookmark, GridItem, FlatFolder } from "../types";

export function useMarcadoresData(
  filterValue: string,
  searchValue: string,
  selectedFolderId: string | null,
  setCtxFolders: (folders: import("@/contexts/DashboardContext").Folder[]) => void,
  refreshFolders: () => void
) {
  const supabase = createClient();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<FlatFolder[]>([]);
  const [loading, setLoading] = useState(true);

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

  const breadcrumb = useMemo(() => getFolderPath(folders, selectedFolderId), [folders, selectedFolderId]);

  return {
    bookmarks,
    setBookmarks,
    folders,
    setFolders,
    loading,
    fetchData,
    flatList,
    breadcrumb,
    supabase,
  };
}
