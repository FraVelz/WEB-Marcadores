-- WEB-Marcadores RLS policies (auth.uid() = user_id)
-- Apply in Supabase SQL editor or via migration. Mirrors src/lib/supabase/rlsPolicy.ts.

alter table public.folders enable row level security;
alter table public.bookmarks enable row level security;

-- folders
drop policy if exists "folders_select_own" on public.folders;
create policy "folders_select_own"
  on public.folders for select
  using (auth.uid() = user_id);

drop policy if exists "folders_insert_own" on public.folders;
create policy "folders_insert_own"
  on public.folders for insert
  with check (auth.uid() = user_id);

drop policy if exists "folders_update_own" on public.folders;
create policy "folders_update_own"
  on public.folders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "folders_delete_own" on public.folders;
create policy "folders_delete_own"
  on public.folders for delete
  using (auth.uid() = user_id);

-- bookmarks
drop policy if exists "bookmarks_select_own" on public.bookmarks;
create policy "bookmarks_select_own"
  on public.bookmarks for select
  using (auth.uid() = user_id);

drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

drop policy if exists "bookmarks_update_own" on public.bookmarks;
create policy "bookmarks_update_own"
  on public.bookmarks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_delete_own"
  on public.bookmarks for delete
  using (auth.uid() = user_id);
