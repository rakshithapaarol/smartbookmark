"use client";

import { addBookmark } from "../app/actions/bookmarks";
import type { Bookmark } from "../app/actions/bookmarks";
import { useRef, useState } from "react";

const storageKey = (uid: string) => `smart-bookmark-add-${uid}`;

export function AddBookmarkForm({ userId }: { userId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await addBookmark(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
    if (result.bookmark) {
      window.dispatchEvent(
        new CustomEvent<Bookmark>("bookmark-added", { detail: result.bookmark })
      );
      try {
        localStorage.setItem(storageKey(userId), JSON.stringify(result.bookmark));
      } catch {
        /* storage may be full or disabled */
      }
    }
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col sm:flex-row gap-3"
    >
      <div className="flex-1 flex flex-col gap-2">
        <input
          name="url"
          type="url"
          placeholder="https://example.com"
          required
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
        />
        <input
          name="title"
          type="text"
          placeholder="Title (optional)"
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
        />
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          className="w-full sm:w-auto rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-6 py-2.5 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          Add Bookmark
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 col-span-full">
          {error}
        </p>
      )}
    </form>
  );
}
