"use client";

import TagAutocomplete from "@/components/TagAutocomplete";

type Props = {
  filterValue: string;
  setFilterValue: (v: string) => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
  allTags: string[];
  focusMain: () => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  filterRef: React.RefObject<HTMLInputElement | null>;
};

export default function ToolbarSearchSection({
  filterValue,
  setFilterValue,
  searchValue,
  setSearchValue,
  allTags,
  focusMain,
  searchRef,
  filterRef,
}: Props) {
  return (
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
  );
}
