CREATE OR REPLACE FUNCTION public.handle_new_waitlist_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log the attempt to call the function
  RAISE NOTICE 'Attempting to send welcome email for new signup: %', NEW.email;
  
  -- Call the Edge Function
  PERFORM extensions.http_post(
    'https://jpelncawdaounkidvymu.supabase.co/functions/v1/send-waitlist-welcome',
    json_build_object(
      'email', NEW.email,
      'firstName', NEW.first_name,
      'teachingLevel', NEW.teaching_level
    )::text,
    'application/json'
  );
  
  -- Log successful execution
  RAISE NOTICE 'Welcome email function called successfully for: %', NEW.email;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log any errors that occur
  RAISE WARNING 'Error in handle_new_waitlist_signup for %: %', NEW.email, SQLERRM;
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