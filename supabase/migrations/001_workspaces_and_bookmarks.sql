-- Extend bookmarks library with usage, favorites, and soft-archive.
ALTER TABLE bookmarks
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS open_count INT NOT NULL DEFAULT 0;

ALTER TABLE bookmarks
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Workspace containers (logical spaces; bookmarks remain user-global).
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workspaces_user_sort_idx ON workspaces(user_id, sort_order);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspaces_owner_select"
  ON workspaces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "workspaces_owner_insert"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workspaces_owner_update"
  ON workspaces FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workspaces_owner_delete"
  ON workspaces FOR DELETE
  USING (auth.uid() = user_id);

-- One layout blob per workspace (zones / panels serialized as JSON).
CREATE TABLE IF NOT EXISTS workspace_layouts (
  workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  revision INT NOT NULL DEFAULT 1,
  payload JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE workspace_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_layouts_owner_rw"
  ON workspace_layouts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_layouts.workspace_id AND w.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_layouts.workspace_id AND w.user_id = auth.uid()
    )
  );

COMMENT ON COLUMN bookmarks.is_favorite IS 'Highlighted bookmark for quick retrieval';
COMMENT ON COLUMN bookmarks.archived_at IS 'When set, bookmark is archived (hidden from default views)';
COMMENT ON COLUMN bookmarks.opened_at IS 'Last time opened from app';
COMMENT ON COLUMN bookmarks.open_count IS 'Approximate opens from app';
