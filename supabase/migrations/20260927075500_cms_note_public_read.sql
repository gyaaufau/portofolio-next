-- Public pages may read published notes only. Admin writes continue through service_role.
ALTER TABLE public.cms_note ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public.cms_note TO anon, authenticated;

DROP POLICY IF EXISTS cms_note_read_published ON public.cms_note;
CREATE POLICY cms_note_read_published
  ON public.cms_note
  FOR SELECT
  TO anon, authenticated
  USING (publication_status = 'published');
