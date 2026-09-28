-- Landing-page sections are public configuration. CMS writes use service_role,
-- while visitors only need read access to visibility, ordering, and settings.
ALTER TABLE public.cms_section ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public.cms_section TO anon, authenticated;

DROP POLICY IF EXISTS cms_section_read_public ON public.cms_section;
CREATE POLICY cms_section_read_public
  ON public.cms_section
  FOR SELECT
  TO anon, authenticated
  USING (true);
