-- Columns expected by the UI for favorites / archive / open stats
alter table public.bookmarks
  add column if not exists is_favorite boolean not null default false,
  add column if not exists archived_at timestamptz null,
  add column if not exists opened_at timestamptz null,
  add column if not exists open_count integer not null default 0;

-- Backfill favorites previously stored only in metadata
update public.bookmarks
set is_favorite = true
where coalesce((metadata ->> 'is_favorite')::boolean, false) is true
  and is_favorite is distinct from true;

create index if not exists bookmarks_favorite_user_idx
  on public.bookmarks (user_id)
  where deleted_at is null and is_favorite = true;
