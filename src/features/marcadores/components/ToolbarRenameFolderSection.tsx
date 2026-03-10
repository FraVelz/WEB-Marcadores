"use client";

type Props = {
  folderName: string;
  setFolderName: (v: string) => void;
  onRename: () => void;
  onCancel: () => void;
};

export default function ToolbarRenameFolderSection({
  folderName,
  setFolderName,
  onRename,
  onCancel,
}: Props) {
  return (
    <div className="ml-2 flex items-center gap-2">
      <input
        type="text"
        placeholder="Nuevo nombre"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onRename();
          if (e.key === "Escape") onCancel();
        }}
        className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
        autoFocus
      />
      <button
        onClick={onRename}
        className="rounded bg-blue-600 px-2 py-1 text-sm text-white hover:bg-blue-700"
      >
        Renombrar
      </button>
      <button onClick={onCancel} className="rounded px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-600">
        Cancelar
      </button>
    </div>
  );
}
