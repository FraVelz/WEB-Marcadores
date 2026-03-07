-- Migrar section a tags y eliminar section
UPDATE bookmarks
SET tags = CASE
  WHEN section IS NOT NULL AND section != '' AND (tags IS NULL OR tags = '{}')
  THEN ARRAY[section]
  WHEN section IS NOT NULL AND section != '' AND NOT (section = ANY(COALESCE(tags, '{}')))
  THEN array_append(COALESCE(tags, '{}'), section)
  ELSE COALESCE(tags, '{}')
END;

-- Eliminar columna section
ALTER TABLE bookmarks DROP COLUMN IF EXISTS section;

-- Eliminar índice que usaba section
DROP INDEX IF EXISTS idx_bookmarks_user_section;
DROP INDEX IF EXISTS idx_bookmarks_section;

-- Nuevos índices para tags
CREATE INDEX IF NOT EXISTS idx_bookmarks_tags ON bookmarks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
