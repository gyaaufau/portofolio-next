-- Public editorial content additions. These columns keep the existing CMS
-- records intact and expose only content that has been published.
ALTER TABLE app ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT '';
ALTER TABLE app ADD COLUMN IF NOT EXISTS release_year integer;
ALTER TABLE cms_note ADD COLUMN IF NOT EXISTS published_at timestamptz;

UPDATE cms_note
SET published_at = COALESCE(published_at, updated_at, created_at)
WHERE publication_status = 'published';

CREATE INDEX IF NOT EXISTS app_catalog_filters ON app (publication_status, category, release_year);
CREATE INDEX IF NOT EXISTS cms_note_public_feed ON cms_note (publication_status, published_at DESC);

INSERT INTO cms_section (id, label, anchor, sort_order, visible)
VALUES
  ('experience', 'Experience', '#experience', 4, true),
  ('skills', 'Skills', '#skills', 5, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO cms_note (id, slug, title, summary, body, tags, publication_status, published_at)
VALUES (
  'how-to-build-scalable-flutter-app-architecture',
  'how-to-build-scalable-flutter-app-architecture',
  'How to Build Scalable Flutter App Architecture',
  'A practical guide to feature boundaries, clean architecture, state management, and performance-minded delivery.',
  E'## Start with feature-first modules\n\nKeep each feature close to its presentation, domain rules, and data code. This makes ownership clear and keeps unrelated work from becoming one large dependency graph.\n\n## Keep widgets thin and state predictable\n\nWidgets should render state and send user intent. Networking, coordination, and data transformation belong in dedicated state and domain code.\n\n- Use one clear state owner for each screen or flow.\n- Make loading, empty, success, and error states explicit.\n- Keep side effects out of build methods.\n\n## Hide infrastructure behind stable interfaces\n\nRepositories can isolate API formatting, persistence, retry policy, and mapping from the UI. That makes later offline support, staging environments, or backend changes much less disruptive.\n\n## Treat performance as architecture\n\nMeasure startup, navigation, image loading, and rebuild scope early. A scalable project stays understandable and responsive as its features and data grow.\n\n## Document the rules\n\nShort conventions for ownership, async errors, dependencies, and release flow let future contributors make changes with confidence.',
  ARRAY['Flutter', 'Architecture', 'Engineering'], 'published', '2026-04-29T09:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
