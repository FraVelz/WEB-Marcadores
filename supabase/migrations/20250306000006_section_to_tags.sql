-- Copiar section a tags (sin borrar section todavía)
-- Ejecuta esto primero para poblar tags con la info de section
UPDATE bookmarks
SET tags = CASE
  WHEN section IS NOT NULL AND section != '' AND (tags IS NULL OR tags = '{}')
  THEN ARRAY[section]
  WHEN section IS NOT NULL AND section != '' AND NOT (section = ANY(COALESCE(tags, '{}')))
  THEN array_append(COALESCE(tags, '{}'), section)
  ELSE COALESCE(tags, '{}')
END
WHERE section IS NOT NULL AND section != '';
