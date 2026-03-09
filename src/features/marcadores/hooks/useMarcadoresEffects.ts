"use client";

import { useEffect } from "react";

type Params<T> = {
  filterValue: string;
  searchValue: string;
  selectedFolderId: string | null;
  selectedIndex: number;
  flatList: { type: string; bookmark?: T }[];
  infoPanelEnabled: boolean;
  modalOpen: boolean;
  pasteError: string | null;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  setGridCols: React.Dispatch<React.SetStateAction<number>>;
  setDetailBookmark: React.Dispatch<React.SetStateAction<T | null>>;
  setPasteError: (v: string | null) => void;
  setShowSearch: (v: boolean) => void;
  setMainKeyDown: (h: ((e: React.KeyboardEvent) => void) | null) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  itemRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
  filterRef: React.RefObject<HTMLInputElement | null>;
  searchRef: React.RefObject<HTMLInputElement | null>;
};

export function useMarcadoresEffects<T>(params: Params<T>) {
  const {
    filterValue,
    searchValue,
    selectedFolderId,
    selectedIndex,
    flatList,
    infoPanelEnabled,
    modalOpen,
    pasteError,
    setSelectedIndex,
    setGridCols,
    setDetailBookmark,
    setPasteError,
    setShowSearch,
    setMainKeyDown,
    handleKeyDown,
    itemRefs,
    filterRef,
    searchRef,
  } = params;

  useEffect(() => setSelectedIndex(0), [filterValue, searchValue, selectedFolderId, setSelectedIndex]);
  useEffect(() => {
    itemRefs.current.get(selectedIndex)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex, itemRefs]);
  useEffect(() => {
    setGridCols(window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
  }, [setGridCols]);
  useEffect(() => {
    const h = () => {
      const cols = window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
      setGridCols(cols);
    };
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [setGridCols]);
  useEffect(() => {
    const item = flatList[selectedIndex];
    if (infoPanelEnabled) setDetailBookmark((item?.type === "link" ? item.bookmark ?? null : null) as T | null);
    else setDetailBookmark(null);
  }, [flatList, selectedIndex, infoPanelEnabled, setDetailBookmark]);
  useEffect(() => {
    if (modalOpen) setMainKeyDown(null);
    else setMainKeyDown(handleKeyDown);
    return () => setMainKeyDown(null);
  }, [setMainKeyDown, handleKeyDown, modalOpen]);
  useEffect(() => {
    if (pasteError) {
      const t = setTimeout(() => setPasteError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [pasteError, setPasteError]);
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
  }, [setShowSearch, filterRef, searchRef]);
}
