-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);