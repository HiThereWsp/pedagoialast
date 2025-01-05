CREATE OR REPLACE FUNCTION public.handle_new_waitlist_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM extensions.http_post(
    'https://jpelncawdaounkidvymu.supabase.co/functions/v1/send-waitlist-welcome',
    json_build_object(
      'email', NEW.email,
      'firstName', NEW.first_name,
      'teachingLevel', NEW.teaching_level
    )::text,
    'application/json'
  );
  RETURN NEW;
END;
$$;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_waitlist_signup ON public.waitlist;

-- Create the trigger
CREATE TRIGGER on_waitlist_signup
  AFTER INSERT ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_waitlist_signup();