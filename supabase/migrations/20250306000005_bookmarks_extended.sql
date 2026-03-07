-- Campos adicionales para marcadores más completos
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS favicon TEXT;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS color TEXT;
