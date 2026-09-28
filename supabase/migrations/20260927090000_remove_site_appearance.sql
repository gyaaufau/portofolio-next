ALTER TABLE site_settings
  DROP COLUMN IF EXISTS accent_preset,
  DROP COLUMN IF EXISTS accent_color,
  DROP COLUMN IF EXISTS logo_src;
