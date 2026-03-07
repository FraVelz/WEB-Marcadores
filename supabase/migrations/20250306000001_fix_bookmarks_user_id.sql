-- Añadir user_id si no existe (por tabla creada manualmente o migración parcial)
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Eliminar políticas antiguas si existen (por si fallaron a medias)
DROP POLICY IF EXISTS "Users can read own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can update own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;

-- RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can read own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own bookmarks"
  ON bookmarks FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Índices (ignorar si ya existen)
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_section ON bookmarks(user_id, section);
CREATE INDEX IF NOT EXISTS idx_bookmarks_section ON bookmarks(section);
