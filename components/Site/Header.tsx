"use client";

import Link from "next/link";
import SiteLogo from "@/components/Site/Logo";
import { ArchiveBook, Trash } from "iconsax-react";
import { useState, useRef, useEffect } from "react";
import { useSavedLinks } from "@/hooks/use-saved-links";
import { formatDistanceToNow } from "date-fns";

const SiteHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { links, removeLink } = useSavedLinks();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="wrapper mx-auto flex max-w-5xl items-center justify-between gap-4 p-4 py-3">
        <Link href={"/"}>
          <SiteLogo />
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArchiveBook size={18} variant="Bulk" />
            <span className="hidden sm:inline">My Links</span>
            {links.length > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                {links.length}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-2 px-2 py-1">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Saved Links
                </h3>
              </div>

              {links.length === 0 ? (
                <div className="px-2 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  <p>No saved links yet.</p>
                  <p className="mt-1 text-xs">
                    Create or view a markdown to save it.
                  </p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="group flex items-center justify-between rounded-lg p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <Link
                        href={`/view?id=${link.id}`}
                        className="flex-1 overflow-hidden"
                        onClick={() => setIsOpen(false)}
                      >
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {link.title || `Markdown ${link.id.substring(0, 6)}`}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {formatDistanceToNow(link.createdAt, {
                            addSuffix: true,
                          })}
                        </p>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLink(link.id);
                        }}
                        className="ml-2 rounded p-1 text-zinc-400 opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        title="Remove"
                      >
                        <Trash size={16} variant="Bulk" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
