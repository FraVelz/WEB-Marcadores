-- Añadir tema y subtema a bookmarks
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS theme TEXT;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS subtheme TEXT;

CREATE INDEX IF NOT EXISTS idx_bookmarks_theme ON bookmarks(theme);
CREATE INDEX IF NOT EXISTS idx_bookmarks_subtheme ON bookmarks(subtheme);
