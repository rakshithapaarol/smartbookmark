# Smart Bookmark

A simple bookmark manager built with Next.js (App Router), Supabase, and Tailwind CSS.

## Features

- **Google OAuth** – Sign up and log in with Google only
- **Add bookmarks** – Save URL + title
- **Private bookmarks** – Each user sees only their own bookmarks (RLS)
- **Real-time updates** – Changes sync across tabs without refresh
- **Delete bookmarks** – Remove your bookmarks
- **Vercel-ready** – Deploy with one click

## Tech Stack

- **Next.js 16** (App Router)
- **Supabase** (Auth, Database, Realtime)
- **Tailwind CSS**

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **Authentication → Providers**, enable **Google** and add your OAuth credentials.
3. In **Authentication → URL Configuration**, add:
   - **Site URL**: `http://localhost:3000` (dev) or your Vercel URL (prod)
   - **Redirect URLs**: `http://localhost:3000/auth/callback` and `https://your-app.vercel.app/auth/callback`

### 3. Run the database migration

In the Supabase SQL Editor, run the contents of `supabase/migrations/001_create_bookmarks.sql`:

```sql
-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;

ALTER TABLE public.bookmarks REPLICA IDENTITY FULL;
```

**Realtime:** Ensure the `bookmarks` table is in the `supabase_realtime` publication. In Supabase Dashboard → **Database** → **Publications**, toggle on `bookmarks` under `supabase_realtime`.

### 4. Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push your code to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://your-app.vercel.app`
4. Add `https://your-app.vercel.app/auth/callback` to Supabase **Redirect URLs**.
5. Deploy.
