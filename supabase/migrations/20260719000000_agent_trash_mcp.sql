-- Soft-delete trash (30d), bookmark metadata, MCP tokens & audit
-- Apply in Supabase SQL editor or via migration runner.

-- bookmarks: trash + metadata
alter table public.bookmarks
  add column if not exists deleted_at timestamptz null,
  add column if not exists deleted_batch_id uuid null,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- folders: trash
alter table public.folders
  add column if not exists deleted_at timestamptz null,
  add column if not exists deleted_batch_id uuid null;

create index if not exists bookmarks_alive_user_idx
  on public.bookmarks (user_id)
  where deleted_at is null;

create index if not exists bookmarks_trash_user_idx
  on public.bookmarks (user_id, deleted_at)
  where deleted_at is not null;

create index if not exists folders_alive_user_idx
  on public.folders (user_id)
  where deleted_at is null;

create index if not exists folders_trash_user_idx
  on public.folders (user_id, deleted_at)
  where deleted_at is not null;

create index if not exists bookmarks_metadata_gin
  on public.bookmarks using gin (metadata);

create index if not exists bookmarks_deleted_batch_idx
  on public.bookmarks (deleted_batch_id)
  where deleted_batch_id is not null;

create index if not exists folders_deleted_batch_idx
  on public.folders (deleted_batch_id)
  where deleted_batch_id is not null;

-- MCP personal access tokens
create table if not exists public.mcp_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  token_hash text not null unique,
  prefix text not null,
  scopes text[] not null default array['bookmarks:read']::text[],
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz null,
  revoked_at timestamptz null
);

create index if not exists mcp_tokens_user_idx on public.mcp_tokens (user_id);

alter table public.mcp_tokens enable row level security;

drop policy if exists "mcp_tokens_select_own" on public.mcp_tokens;
create policy "mcp_tokens_select_own"
  on public.mcp_tokens for select
  using (auth.uid() = user_id);

drop policy if exists "mcp_tokens_insert_own" on public.mcp_tokens;
create policy "mcp_tokens_insert_own"
  on public.mcp_tokens for insert
  with check (auth.uid() = user_id);

drop policy if exists "mcp_tokens_update_own" on public.mcp_tokens;
create policy "mcp_tokens_update_own"
  on public.mcp_tokens for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Audit log (append via service role; users can read own)
create table if not exists public.mcp_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token_id uuid null references public.mcp_tokens (id) on delete set null,
  action text not null,
  resource_type text null,
  resource_id text null,
  ip text null,
  user_agent text null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists mcp_audit_log_user_created_idx
  on public.mcp_audit_log (user_id, created_at desc);

alter table public.mcp_audit_log enable row level security;

drop policy if exists "mcp_audit_select_own" on public.mcp_audit_log;
create policy "mcp_audit_select_own"
  on public.mcp_audit_log for select
  using (auth.uid() = user_id);

-- Purge helper (call from cron / Edge Function with service role)
-- delete from public.bookmarks where deleted_at < now() - interval '30 days';
-- delete from public.folders where deleted_at < now() - interval '30 days';
