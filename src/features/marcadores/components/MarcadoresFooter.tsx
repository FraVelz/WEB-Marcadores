"use client";

import type { GridItem } from "../types";

type Props = {
  flatList: GridItem[];
  selectedIndex: number;
};

export default function MarcadoresFooter({ flatList, selectedIndex }: Props) {
  const item = flatList[selectedIndex];
  return (
    <div className="flex items-center justify-between border-t border-zinc-700 bg-[#252526] px-3 py-1 text-xs text-zinc-500">
      <span>
        {flatList.length} elemento{flatList.length !== 1 ? "s" : ""}
      </span>
      {item?.type === "link" && (
        <span className="truncate max-w-[400px]">{item.bookmark.url}</span>
      )}
    </div>
  );
}
