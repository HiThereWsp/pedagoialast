
import { supabase } from '@/integrations/supabase/client';

/**
 * Sends a notification when a bug report status is updated
 */
export const sendBugReportNotification = async (reportId: string): Promise<void> => {
  try {
    const response = await supabase.functions.invoke('send-bug-report-notification', {
      body: { reportId }
    });
    
    if (response.error) {
      console.error('Error sending notification:', response.error);
    }
  } catch (error) {
    console.error('Failed to send status change notification:', error);
  }
};
