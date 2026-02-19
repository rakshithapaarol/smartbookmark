"use server";

import { createClient } from "../../utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Bookmark = {
  id: string;
  user_id: string;
  url: string;
  title: string;
  created_at: string;
};

export async function addBookmark(formData: FormData) {
  const supabase = await createClient();
  const url = formData.get("url") as string;
  const title = formData.get("title") as string;

  if (!url?.trim()) {
    return { error: "URL is required" };
  }

  let defaultTitle = "";
  try {
    defaultTitle = new URL(url).hostname;
  } catch {
    defaultTitle = url;
  }

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      url: url.trim(),
      title: title?.trim() || defaultTitle,
      user_id: user.user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true, bookmark: data as Bookmark };
}

export async function deleteBookmark(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("bookmarks").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}
