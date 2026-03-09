"use client";

type Props = {
  title: string;
  url: string;
  description: string;
  firstInputRef: React.RefObject<HTMLInputElement | null>;
};

export default function BookmarkFormBasicInfo({
  title,
  url,
  description,
  firstInputRef,
}: Props) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-400">Información básica</h3>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">Título *</label>
        <input
          ref={firstInputRef}
          name="title"
          defaultValue={title}
          required
          autoComplete="off"
          data-no-vim
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">URL *</label>
        <input
          name="url"
          type="url"
          defaultValue={url}
          required
          data-no-vim
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">Descripción</label>
        <input
          name="description"
          defaultValue={description}
          data-no-vim
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
        />
      </div>
    </section>
  );
}
