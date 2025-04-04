
-- Add onboarding fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_tasks BOOLEAN[] DEFAULT ARRAY[FALSE, FALSE, FALSE, FALSE, FALSE, FALSE];

-- Create a function to handle onboarding status updates
CREATE OR REPLACE FUNCTION update_onboarding_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If all tasks are completed, set onboarding_completed to TRUE
  IF (NEW.onboarding_tasks = ARRAY[TRUE, TRUE, TRUE, TRUE, TRUE, TRUE]) THEN
    NEW.onboarding_completed := TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the function before insert or update
DROP TRIGGER IF EXISTS before_user_profile_upsert ON user_profiles;
CREATE TRIGGER before_user_profile_upsert
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_status();
