"use client";

import { deleteBookmark } from "../app/actions/bookmarks";
import { createClient } from "../utils/supabase/client";
import type { Bookmark } from "../app/actions/bookmarks";
import { useEffect, useState } from "react";

const storageKey = (uid: string) => `smart-bookmark-add-${uid}`;

export function BookmarkList({
  initialBookmarks,
  userId,
}: {
  initialBookmarks: Bookmark[];
  userId: string;
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);

  useEffect(() => {
    setBookmarks(initialBookmarks);
  }, [initialBookmarks]);

  useEffect(() => {
    const onAdded = (e: Event) => {
      const b = (e as CustomEvent<Bookmark>).detail;
      setBookmarks((prev) => (prev.some((x) => x.id === b.id) ? prev : [b, ...prev]));
    };
    window.addEventListener("bookmark-added", onAdded);
    return () => window.removeEventListener("bookmark-added", onAdded);
  }, []);

  useEffect(() => {
    const key = storageKey(userId);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const b = JSON.parse(e.newValue) as Bookmark;
          setBookmarks((prev) => (prev.some((x) => x.id === b.id) ? prev : [b, ...prev]));
        } catch {
          /* ignore parse errors */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [userId]);

  useEffect(() => {
    const supabase = createClient();
    const postgresCh = supabase
      .channel("bookmarks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const b = payload.new as Bookmark;
            setBookmarks((prev) => (prev.some((x) => x.id === b.id) ? prev : [b, ...prev]));
          } else if (payload.eventType === "DELETE") {
            const old = payload.old as { id: string };
            setBookmarks((prev) => prev.filter((b) => b.id !== old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postgresCh);
    };
  }, []);

  async function handleDelete(id: string) {
    await deleteBookmark(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  if (bookmarks.length === 0) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400 text-center py-12">
        No bookmarks yet. Add your first one above!
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
      {bookmarks.map((bookmark) => (
        <li
          key={bookmark.id}
          className="flex items-center justify-between gap-4 py-4 first:pt-0"
        >
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 group"
          >
            <span className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 truncate block">
              {bookmark.title}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400 truncate block">
              {bookmark.url}
            </span>
          </a>
          <button
            onClick={() => handleDelete(bookmark.id)}
            aria-label="Delete bookmark"
            className="flex-shrink-0 rounded p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
