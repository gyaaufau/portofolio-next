-- Additive CMS schema. Apply after scripts/supabase-tables.sql.
ALTER TABLE app ADD COLUMN IF NOT EXISTS publication_status text NOT NULL DEFAULT 'published';
ALTER TABLE certificate ADD COLUMN IF NOT EXISTS publication_status text NOT NULL DEFAULT 'published';
ALTER TABLE work_experience ADD COLUMN IF NOT EXISTS publication_status text NOT NULL DEFAULT 'published';
ALTER TABLE app ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT '';
ALTER TABLE app ADD COLUMN IF NOT EXISTS release_year integer;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_publication_status_check') THEN
    ALTER TABLE app ADD CONSTRAINT app_publication_status_check CHECK (publication_status IN ('published', 'draft'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'certificate_publication_status_check') THEN
    ALTER TABLE certificate ADD CONSTRAINT certificate_publication_status_check CHECK (publication_status IN ('published', 'draft'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'work_publication_status_check') THEN
    ALTER TABLE work_experience ADD CONSTRAINT work_publication_status_check CHECK (publication_status IN ('published', 'draft'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS cms_draft (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('app', 'note', 'certificate', 'experience', 'skills', 'section', 'settings')),
  entity_id text NOT NULL,
  title text NOT NULL DEFAULT '',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, entity_id)
);
CREATE INDEX IF NOT EXISTS cms_draft_updated ON cms_draft (updated_at DESC);

CREATE TABLE IF NOT EXISTS cms_note (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  cover_src text,
  publication_status text NOT NULL DEFAULT 'published' CHECK (publication_status IN ('published', 'draft')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS app_catalog_filters ON app (publication_status, category, release_year);
CREATE INDEX IF NOT EXISTS cms_note_public_feed ON cms_note (publication_status, published_at DESC);

CREATE TABLE IF NOT EXISTS cms_section (
  id text PRIMARY KEY,
  label text NOT NULL,
  anchor text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO cms_section (id, label, anchor, sort_order) VALUES
  ('hero', 'Hero', '#hero', 0),
  ('work', 'Selected work', '#work', 1),
  ('apps', 'App catalog', '#apps', 2),
  ('about', 'About and experience', '#about', 3),
  ('certificates', 'Skills and certificates', '#certificates', 4),
  ('notes', 'Notes', '#notes', 5),
  ('contact', 'Contact CTA', '#contact', 6)
ON CONFLICT (id) DO NOTHING;
INSERT INTO cms_section (id, label, anchor, sort_order) VALUES
  ('experience', 'Experience', '#experience', 4),
  ('skills', 'Skills', '#skills', 5)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS cms_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL CHECK (bucket IN ('apps', 'portfolio')),
  storage_path text NOT NULL,
  public_url text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bucket, storage_path)
);

-- Publish an app and its screenshot set in one transaction. A failure in either
-- write rolls the entire function back, leaving the current public app intact.
CREATE OR REPLACE FUNCTION cms_publish_app(
  p_id text,
  p_record jsonb,
  p_screenshots jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_app app%ROWTYPE;
BEGIN
  -- Insert only required fields first so database defaults populate any app
  -- columns added by other migrations.
  INSERT INTO app (
    id, title, slug, tagline, description, app_type, work_type, period,
    period_short, app_icon_src, app_icon_alt, thumbnail_src, thumbnail_alt
  ) VALUES (
    p_id, p_record->>'title', p_record->>'slug',
    p_record->>'tagline', p_record->>'description',
    p_record->>'app_type', p_record->>'work_type',
    p_record->>'period', p_record->>'period_short',
    p_record->>'app_icon_src', p_record->>'app_icon_alt',
    p_record->>'thumbnail_src', p_record->>'thumbnail_alt'
  ) ON CONFLICT (id) DO NOTHING;
  SELECT * INTO v_app FROM app WHERE id = p_id FOR UPDATE;
  v_app := jsonb_populate_record(v_app, p_record);
  IF v_app.id IS DISTINCT FROM p_id THEN
    RAISE EXCEPTION 'App ID mismatch';
  END IF;
  v_app.created_at := coalesce(v_app.created_at, now());
  v_app.sections := coalesce(v_app.sections, '[]'::jsonb);

  INSERT INTO app SELECT (v_app).*
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    featured = EXCLUDED.featured,
    app_type = EXCLUDED.app_type,
    work_type = EXCLUDED.work_type,
    period = EXCLUDED.period,
    period_short = EXCLUDED.period_short,
    sort_order = EXCLUDED.sort_order,
    app_store_url = EXCLUDED.app_store_url,
    play_store_url = EXCLUDED.play_store_url,
    website_url = EXCLUDED.website_url,
    github_url = EXCLUDED.github_url,
    other_url = EXCLUDED.other_url,
    other_url_label = EXCLUDED.other_url_label,
    app_icon_src = EXCLUDED.app_icon_src,
    app_icon_alt = EXCLUDED.app_icon_alt,
    thumbnail_src = EXCLUDED.thumbnail_src,
    thumbnail_alt = EXCLUDED.thumbnail_alt,
    stack = EXCLUDED.stack,
    highlights = EXCLUDED.highlights,
    sections = EXCLUDED.sections,
    publication_status = EXCLUDED.publication_status,
    updated_at = EXCLUDED.updated_at;

  IF p_screenshots IS NOT NULL THEN
    IF jsonb_typeof(p_screenshots) <> 'array' THEN
      RAISE EXCEPTION 'Invalid screenshots';
    END IF;
    DELETE FROM app_screenshot WHERE app_id = p_id;
    INSERT INTO app_screenshot (app_id, src, alt, width, height, "order")
    SELECT p_id, shot.src, shot.alt, shot.width, shot.height, shot."order"
    FROM jsonb_to_recordset(p_screenshots) AS shot(
      src text, alt text, width integer, height integer, "order" integer
    );
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION cms_publish_app(text, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION cms_publish_app(text, jsonb, jsonb) TO service_role;
