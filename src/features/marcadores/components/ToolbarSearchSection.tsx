"use client";

type Props = {
  searchValue: string;
  setSearchValue: (v: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
};

export default function ToolbarSearchSection({
  searchValue,
  setSearchValue,
  searchRef,
}: Props) {
  return (
    <div className="ml-2 flex flex-1 items-center gap-2">
      <input
        ref={searchRef}
        type="text"
        placeholder="Buscar en título, descripción, URL, tags..."
        data-no-vim
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="flex-1 rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}
