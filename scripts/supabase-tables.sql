-- Supabase table creation SQL
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS profile (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  intro TEXT NOT NULL,
  location TEXT NOT NULL,
  open_to_opportunities BOOLEAN DEFAULT true,
  photo_src TEXT NOT NULL,
  photo_alt TEXT NOT NULL,
  photo_width INT DEFAULT 400,
  photo_height INT DEFAULT 500
);

CREATE TABLE IF NOT EXISTS contact (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  github TEXT NOT NULL,
  linkedin TEXT NOT NULL,
  play_store TEXT NOT NULL,
  play_console TEXT NOT NULL,
  cv TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hero_link (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  kind TEXT NOT NULL,
  note TEXT NOT NULL,
  "order" INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS directory_link (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  value TEXT NOT NULL,
  href TEXT NOT NULL,
  caption TEXT NOT NULL,
  "order" INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS app (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  app_type TEXT NOT NULL,
  work_type TEXT NOT NULL,
  period TEXT NOT NULL,
  period_short TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  app_store_url TEXT,
  play_store_url TEXT,
  website_url TEXT,
  github_url TEXT,
  other_url TEXT,
  other_url_label TEXT,
  app_icon_src TEXT NOT NULL,
  app_icon_alt TEXT NOT NULL,
  thumbnail_src TEXT NOT NULL,
  thumbnail_alt TEXT NOT NULL,
  stack TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  sections JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_featured_sort ON app (featured, sort_order);

CREATE TABLE IF NOT EXISTS app_screenshot (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  src TEXT NOT NULL,
  alt TEXT NOT NULL,
  width INT NOT NULL,
  height INT NOT NULL,
  "order" INT DEFAULT 0,
  app_id TEXT NOT NULL REFERENCES app(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_app_screenshot_app_order ON app_screenshot (app_id, "order");

CREATE TABLE IF NOT EXISTS certificate (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  issuer TEXT NOT NULL,
  issued TEXT NOT NULL,
  type TEXT NOT NULL,
  summary TEXT NOT NULL,
  details TEXT[] DEFAULT '{}',
  relevance TEXT NOT NULL,
  issuer_notes TEXT[] DEFAULT '{}',
  image_src TEXT,
  image_alt TEXT,
  image_width INT,
  image_height INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificate_featured_issued ON certificate (featured, issued);

CREATE TABLE IF NOT EXISTS work_experience (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  role TEXT NOT NULL,
  start TEXT NOT NULL,
  "end" TEXT NOT NULL,
  period TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  summary TEXT NOT NULL,
  highlights TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_work_experience_sort ON work_experience (sort_order);

CREATE TABLE IF NOT EXISTS skill_category (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT UNIQUE NOT NULL,
  items TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'site',
  accent_preset TEXT DEFAULT 'moss',
  accent_color TEXT DEFAULT '#4F7A68',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
