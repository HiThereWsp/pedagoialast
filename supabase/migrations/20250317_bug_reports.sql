
-- Create the bug_reports table
CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  description TEXT NOT NULL,
  screenshot_url TEXT,
  browser_info JSONB,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create RLS policies for the bug_reports table
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create bug reports
CREATE POLICY "Allow users to create bug reports" ON bug_reports
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow users to view their own bug reports
CREATE POLICY "Allow users to view their own bug reports" ON bug_reports
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bug_reports_updated_at
BEFORE UPDATE ON bug_reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create a bucket for bug report screenshots if it doesn't exist
-- This will be executed in a separate step since it's not SQL
