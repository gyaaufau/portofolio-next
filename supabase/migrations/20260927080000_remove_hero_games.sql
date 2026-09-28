UPDATE site_settings
SET accent_preset = 'ember', accent_color = '#C45132'
WHERE id = 'site'
  AND accent_preset = 'moss'
  AND upper(accent_color) = '#4F7A68';

ALTER TABLE site_settings ALTER COLUMN accent_preset SET DEFAULT 'ember';
ALTER TABLE site_settings ALTER COLUMN accent_color SET DEFAULT '#C45132';
ALTER TABLE site_settings DROP COLUMN IF EXISTS hero_game_id;
