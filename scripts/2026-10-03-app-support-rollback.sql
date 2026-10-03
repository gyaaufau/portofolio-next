BEGIN;

-- Persist legal settings atomically with app and screenshots.
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
    category = EXCLUDED.category,
    release_year = EXCLUDED.release_year,
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
    has_privacy_policy = EXCLUDED.has_privacy_policy,
    privacy_policy_content = EXCLUDED.privacy_policy_content,
    has_account_deletion = EXCLUDED.has_account_deletion,
    account_deletion_content = EXCLUDED.account_deletion_content,
    account_deletion_requires_auth = EXCLUDED.account_deletion_requires_auth,
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

ALTER TABLE public.app DROP COLUMN IF EXISTS support_email, DROP COLUMN IF EXISTS support_content;

COMMIT;
