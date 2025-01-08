-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the customer emails function to run daily at 9:00 AM UTC
SELECT cron.schedule(
  'schedule-customer-emails-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url:='https://jpelncawdaounkidvymu.supabase.co/functions/v1/schedule-customer-emails',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) AS request_id;
  $$
);