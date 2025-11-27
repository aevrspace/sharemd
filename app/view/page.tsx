"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Viewer } from "@/components/viewer";
import Loader from "@/components/ui/aevr/loader";
import { InfoBox } from "@/components/ui/aevr/info-box";
import { ArchiveBook, DocumentDownload, Share } from "iconsax-react";
import { toast } from "sonner";
import { useSavedLinks } from "@/hooks/use-saved-links";

function ViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSaved, saveLink, removeLink } = useSavedLinks();

  useEffect(() => {
    const fetchContent = async () => {
      if (!id) {
        setError("No ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/view/${id}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch content");
        }
        setContent(result.data.content);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `markdown-${id || "file"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  const handleBookmark = () => {
    if (!id) return;
    if (isSaved(id)) {
      removeLink(id);
      toast.success("Removed from saved links");
    } else {
      saveLink(id, "Saved Markdown");
      toast.success("Added to saved links");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader loading={true} className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <InfoBox
          type="error"
          title="Error"
          description={error}
          className="max-w-md"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-end gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            title="Share Link"
          >
            <Share size={18} variant="Bulk" color="currentColor" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            title="Download Markdown"
          >
            <DocumentDownload size={18} variant="Bulk" color="currentColor" />
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              id && isSaved(id)
                ? "border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:border-indigo-900/30 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
            title={id && isSaved(id) ? "Remove Bookmark" : "Bookmark"}
          >
            <ArchiveBook
              size={18}
              variant={id && isSaved(id) ? "Bold" : "Bulk"}
              color="currentColor"
            />
            <span className="hidden sm:inline">
              {id && isSaved(id) ? "Saved" : "Save"}
            </span>
          </button>
        </div>
        {content && <Viewer content={content} />}
      </div>
    </div>
  );
}

export default function ViewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader loading={true} />
        </div>
      }
    >
      <ViewContent />
    </Suspense>
  );
}
