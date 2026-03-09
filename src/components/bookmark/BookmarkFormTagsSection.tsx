"use client";

import TagAutocomplete from "@/components/TagAutocomplete";

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  onSelectTag: (tag: string) => void;
};

export default function BookmarkFormTagsSection({
  value,
  onChange,
  options,
  onSelectTag,
}: Props) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-400">Tags</h3>
      <div>
        <TagAutocomplete
          value={value}
          onChange={onChange}
          options={options}
          onSelectTag={onSelectTag}
          placeholder="web, herramientas, ..."
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
        />
      </div>
    </section>
  );
}
