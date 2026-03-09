"use client";

type Props = { message: string };

export default function PasteErrorBanner({ message }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 border-b border-red-500/50 bg-red-900/30 px-3 py-2 text-sm text-red-200">
      <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      {message}
    </div>
  );
}
