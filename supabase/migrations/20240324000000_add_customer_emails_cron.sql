-- Enable the required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cron job to run every minute
SELECT cron.schedule(
  'process-welcome-emails',
  '* * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://jpelncawdaounkidvymu.supabase.co/functions/v1/process-welcome-emails',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZWxuY2F3ZGFvdW5raWR2eW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzgxNTEsImV4cCI6MjA0ODQxNDE1MX0.tzGxd93BPGQa8w4BRb6AOujbIjvI-XEIgU7SlnlZZt4"}'::jsonb
    ) as request_id;
  $$
);