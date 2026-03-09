-- Sistema de carpetas libre (jerarquía ilimitada)
-- Reemplaza theme/subtheme por carpetas anidadas

-- 1. Crear tabla folders
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own folders"
  ON folders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own folders"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own folders"
  ON folders FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own folders"
  ON folders FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE INDEX idx_folders_user_parent ON folders(user_id, parent_id);
CREATE INDEX idx_folders_parent ON folders(parent_id);

-- 2. Añadir folder_id a bookmarks
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookmarks_folder ON bookmarks(folder_id);

-- 3. Migrar theme/subtheme a carpetas (si existen esas columnas)
DO $$
DECLARE
  has_theme BOOLEAN;
  rec RECORD;
  v_theme TEXT;
  v_subtheme TEXT;
  theme_folder_id UUID;
  subtheme_folder_id UUID;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bookmarks' AND column_name = 'theme'
  ) INTO has_theme;

  IF has_theme THEN
    -- Por cada usuario (o bookmarks sin user), crear carpetas desde theme/subtheme
    FOR rec IN
      SELECT DISTINCT b.user_id,
             COALESCE(NULLIF(TRIM(b.theme), ''), 'Sin tema') AS theme,
             COALESCE(NULLIF(TRIM(b.subtheme), ''), 'Sin subtema') AS subtheme
      FROM bookmarks b
      WHERE b.folder_id IS NULL
    LOOP
      v_theme := rec.theme;
      v_subtheme := rec.subtheme;

      -- Obtener o crear carpeta tema (raíz)
      SELECT id INTO theme_folder_id
      FROM folders
      WHERE parent_id IS NULL
        AND name = v_theme
        AND (user_id IS NOT DISTINCT FROM rec.user_id)
      LIMIT 1;

      IF theme_folder_id IS NULL THEN
        INSERT INTO folders (user_id, parent_id, name, sort_order)
        VALUES (rec.user_id, NULL, v_theme, 0)
        RETURNING id INTO theme_folder_id;
      END IF;

      -- Si tiene subtema válido (no "Sin subtema"), crear carpeta hija
      IF v_subtheme IS NOT NULL AND v_subtheme != '' AND v_subtheme != 'Sin subtema' THEN
        SELECT id INTO subtheme_folder_id
        FROM folders
        WHERE parent_id = theme_folder_id
          AND name = v_subtheme
        LIMIT 1;

        IF subtheme_folder_id IS NULL THEN
          INSERT INTO folders (user_id, parent_id, name, sort_order)
          VALUES (rec.user_id, theme_folder_id, v_subtheme, 0)
          RETURNING id INTO subtheme_folder_id;
        END IF;

        UPDATE bookmarks
        SET folder_id = subtheme_folder_id
        WHERE (user_id IS NOT DISTINCT FROM rec.user_id)
          AND COALESCE(NULLIF(TRIM(theme), ''), 'Sin tema') = v_theme
          AND COALESCE(NULLIF(TRIM(subtheme), ''), 'Sin subtema') = v_subtheme
          AND folder_id IS NULL;
      ELSE
        -- Sin subtema: asignar a carpeta tema
        UPDATE bookmarks
        SET folder_id = theme_folder_id
        WHERE (user_id IS NOT DISTINCT FROM rec.user_id)
          AND COALESCE(NULLIF(TRIM(theme), ''), 'Sin tema') = v_theme
          AND (COALESCE(NULLIF(TRIM(subtheme), ''), 'Sin subtema') = 'Sin subtema' OR subtheme IS NULL OR subtheme = '')
          AND folder_id IS NULL;
      END IF;
    END LOOP;

    -- Caso adicional: bookmarks que pudieron quedar sin asignar (por variaciones en NULL/empty)
    UPDATE bookmarks b
    SET folder_id = f.id
    FROM folders f
    WHERE b.folder_id IS NULL
      AND f.parent_id IS NULL
      AND (b.user_id IS NOT DISTINCT FROM f.user_id)
      AND COALESCE(NULLIF(TRIM(b.theme), ''), 'Sin tema') = f.name;
  END IF;
END $$;
