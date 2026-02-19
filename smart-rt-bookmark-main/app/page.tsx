import { createClient } from "../utils/supabase/server";
import { AuthButton } from "../components/auth-button";
import { AddBookmarkForm } from "../components/add-bookmark-form";
import { BookmarkList } from "../components/bookmark-list";
import type { Bookmark } from "./actions/bookmarks";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let bookmarks: Bookmark[] = [];
  if (user) {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    bookmarks = (data ?? []) as Bookmark[];
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Smart Bookmark
          </h1>
          <AuthButton user={user} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {user ? (
          <>
            <section className="mb-8">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
                Add a bookmark
              </h2>
              <AddBookmarkForm userId={user.id} />
            </section>
            <section>
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
                Your bookmarks
              </h2>
              <BookmarkList initialBookmarks={bookmarks} userId={user.id} />
            </section>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Welcome to Smart Bookmark
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md">
              Sign in with Google to save and manage your bookmarks. They sync
              across devices and update in real time.
            </p>
            <AuthButton user={null} />
          </div>
        )}
      </main>
    </div>
  );
}
