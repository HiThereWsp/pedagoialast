
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import type { BugReport } from './types';
import type { User } from '@supabase/supabase-js';
import { bugReportEvents } from '@/integrations/posthog/events';

export const useReportSubmission = (
  user: User | null,
  screenshot: string | File | null,
  description: string,
  resetForm: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const submitReport = async () => {
    try {
      setIsSubmitting(true);
      setSubmissionError(null);
      
      let screenshotUrl: string | undefined;
      
      // Track the start of bug report creation
      bugReportEvents.reportCreated({
        userId: user?.id,
        hasScreenshot: !!screenshot,
        source: window.location.pathname
      });
      
      // If a screenshot is present, upload it to Supabase Storage
      if (screenshot) {
        const fileName = `bug-reports/${uuidv4()}-${Date.now()}.png`;
        
        if (typeof screenshot === 'string' && screenshot.startsWith('data:image')) {
          // Convert dataURL to blob for upload
          const response = await fetch(screenshot);
          const blob = await response.blob();
          
          const { data, error } = await supabase.storage
            .from('bug-reports')
            .upload(fileName, blob, {
              contentType: 'image/png',
              cacheControl: '3600',
            });
            
          if (error) throw error;
          if (data) {
            const { data: urlData } = supabase.storage
              .from('bug-reports')
              .getPublicUrl(fileName);
              
            screenshotUrl = urlData.publicUrl;
          }
        } else if (screenshot instanceof File) {
          // Direct file upload
          const { data, error } = await supabase.storage
            .from('bug-reports')
            .upload(fileName, screenshot, {
              cacheControl: '3600',
            });
            
          if (error) throw error;
          if (data) {
            const { data: urlData } = supabase.storage
              .from('bug-reports')
              .getPublicUrl(fileName);
              
            screenshotUrl = urlData.publicUrl;
          }
        }
      }
      
      // Collect browser and environment information
      const browserInfo = JSON.stringify({
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        platform: navigator.platform,
        language: navigator.language,
        pageUrl: window.location.href,
        referrer: document.referrer || 'direct',
        timestamp: new Date().toISOString()
      });
      
      // Create the bug report in the database
      const bugReport: BugReport = {
        user_id: user?.id,
        description,
        screenshot_url: screenshotUrl,
        browser_info: browserInfo,
        url: window.location.href,
        status: 'new',
      };
      
      // Insert the bug report
      const { data, error } = await supabase
        .from('bug_reports')
        .insert(bugReport)
        .select();
        
      if (error) throw error;
      
      // First check that data exists and has an id property
      if (data && Array.isArray(data) && data.length > 0 && data[0] && 'id' in data[0]) {
        const reportId = data[0].id;
        
        try {
          // Notify administrator by email via our edge function
          const notificationResponse = await supabase.functions.invoke('send-bug-report-notification', {
            body: {
              reportId,
              description,
              screenshotUrl,
              url: window.location.href,
              userId: user?.id,
            }
          });
          
          // Track successful submission
          bugReportEvents.reportSubmitted({
            reportId,
            success: true
          });
          
          if (notificationResponse.error) {
            console.warn('Bug report created but notification may have failed:', notificationResponse.error);
          }
        } catch (notificationError) {
          console.error('Error sending bug report notification:', notificationError);
          // Track failed notification but successful DB submission
          bugReportEvents.reportSubmitted({
            reportId,
            success: true,
            errorMessage: 'Notification failed'
          });
        }
        
        return data;
      } else {
        throw new Error('Report created but ID is not available');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du rapport de bug:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSubmissionError(errorMessage);
      
      // Track failed submission
      bugReportEvents.reportSubmitted({
        reportId: 'failed',
        success: false,
        errorMessage
      });
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submissionError,
    submitReport
  };
};
