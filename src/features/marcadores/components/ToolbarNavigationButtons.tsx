"use client";

type Props = {
  onNavigateUp: () => void;
  onAddBookmark: () => void;
  onNewFolder: () => void;
  infoPanelEnabled: boolean;
  onToggleInfoPanel: () => void;
  showSearch: boolean;
  onToggleSearch: () => void;
};

export default function ToolbarNavigationButtons({
  onNavigateUp,
  onAddBookmark,
  onNewFolder,
  infoPanelEnabled,
  onToggleInfoPanel,
  showSearch,
  onToggleSearch,
}: Props) {
  return (
    <>
      <button
        type="button"
        onClick={onNavigateUp}
        className="rounded p-1.5 text-zinc-400 hover:bg-zinc-600 hover:text-white"
        title="Subir"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
        </svg>
      </button>
      <div className="mx-1 h-5 w-px bg-zinc-600" />
      <button
        type="button"
        onClick={onAddBookmark}
        className="rounded p-1.5 text-zinc-400 hover:bg-zinc-600 hover:text-white"
        title="Nuevo marcador"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onNewFolder}
        className="rounded p-1.5 text-zinc-400 hover:bg-zinc-600 hover:text-white"
        title="Nueva carpeta"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onToggleInfoPanel}
        className={`rounded p-1.5 ${
          infoPanelEnabled ? "bg-zinc-600 text-white" : "text-zinc-400 hover:bg-zinc-600 hover:text-white"
        }`}
        title="Modo información (i)"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-4h-2V7h2v2z" />
        </svg>
      </button>
      <div className="mx-1 h-5 w-px bg-zinc-600" />
      <button
        type="button"
        onClick={onToggleSearch}
        className={`rounded p-1.5 ${
          showSearch ? "bg-zinc-600 text-white" : "text-zinc-400 hover:bg-zinc-600 hover:text-white"
        }`}
        title="Buscar (Ctrl+F)"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      </button>
    </>
  );
}
