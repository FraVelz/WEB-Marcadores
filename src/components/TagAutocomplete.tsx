"use client";

import { useState, useRef, useEffect, useMemo } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  onEnter?: () => void;
  onSelectTag?: (tag: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  placeholder?: string;
  className?: string;
};

export default function TagAutocomplete({
  value,
  onChange,
  options,
  onEnter,
  onSelectTag,
  inputRef: externalRef,
  placeholder = "Etiqueta...",
  className = "",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const internalRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = externalRef || internalRef;

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options;
    return options.filter((t) => t.toLowerCase().includes(q));
  }, [options, value]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [value, filtered]);

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      listRef.current.children[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const selectTag = (tag: string) => {
    if (onSelectTag) {
      onSelectTag(tag);
      onChange("");
    } else {
      onChange(tag);
    }
    setIsOpen(false);
    inputRef.current?.blur();
    onEnter?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filtered.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        onEnter?.();
      }
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      setHighlightedIndex((i) =>
        e.shiftKey ? (i - 1 + filtered.length) % filtered.length : (i + 1) % filtered.length
      );
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % filtered.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + filtered.length) % filtered.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = filtered[highlightedIndex];
      if (tag) selectTag(tag);
      return;
    }
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls="tag-listbox"
        aria-activedescendant={isOpen && filtered[highlightedIndex] ? `tag-opt-${highlightedIndex}` : undefined}
      />
      {isOpen && filtered.length > 0 && (
        <ul
          id="tag-listbox"
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-zinc-600 bg-zinc-800 py-1 shadow-lg"
        >
          {filtered.map((tag, i) => (
            <li
              key={tag}
              id={`tag-opt-${i}`}
              role="option"
              aria-selected={i === highlightedIndex}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === highlightedIndex ? "bg-zinc-700 text-white" : "text-zinc-300 hover:bg-zinc-700"
              }`}
              onMouseEnter={() => setHighlightedIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                selectTag(tag);
              }}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
