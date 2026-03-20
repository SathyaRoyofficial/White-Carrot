-- CareerCraft Supabase Schema

-- Users table is managed by Supabase Auth (auth.users), but we can create a public profile table if needed.
-- For now, we will just use auth.users and create subsequent tables linked to auth.users.id

CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#5138EE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  theme_settings JSONB DEFAULT '{}'::jsonb,
  published BOOLEAN DEFAULT false
);

CREATE TABLE sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'hero', 'about', 'jobs', 'culture'
  content JSONB DEFAULT '{}'::jsonb,
  order_index INTEGER NOT NULL
);

CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  type TEXT, -- 'Full-time', 'Part-time', etc.
  salary TEXT,
  skills TEXT[],
  apply_link TEXT,
  apply_email TEXT,
  keyword TEXT,
  status TEXT DEFAULT 'Draft', -- 'Active', 'Draft'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  current_company TEXT,
  linkedin_url TEXT,
  location TEXT,
  resume_url TEXT NOT NULL,
  right_to_work TEXT,
  willing_to_relocate TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Allow users to read/write their own company data
CREATE POLICY "Users can manage their own companies" ON companies
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their company pages" ON pages
  FOR ALL USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their company sections" ON sections
  FOR ALL USING (
    page_id IN (SELECT id FROM pages WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can manage their company jobs" ON jobs
  FOR ALL USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can read their company applications" ON applications
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can insert applications" ON applications
  FOR INSERT WITH CHECK (true);

-- Public read access for published pages and jobs
CREATE POLICY "Anyone can read published pages" ON pages
  FOR SELECT USING (published = true);

CREATE POLICY "Anyone can read active jobs" ON jobs
  FOR SELECT USING (status = 'Active');

CREATE POLICY "Anyone can read companies with published pages" ON companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM pages WHERE published = true)
  );

CREATE POLICY "Anyone can read sections of published pages" ON sections
  FOR SELECT USING (
    page_id IN (SELECT id FROM pages WHERE published = true)
  );
