
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import type { BugReport } from './types';
import type { User } from '@supabase/supabase-js';

export const useReportSubmission = (
  user: User | null,
  screenshot: string | File | null,
  description: string,
  resetForm: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = async () => {
    try {
      setIsSubmitting(true);
      
      let screenshotUrl: string | undefined;
      
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
      
      // Use "as any" as a temporary solution for database typings
      const { data, error } = await supabase
        .from('bug_reports' as any)
        .insert(bugReport)
        .select();
        
      if (error) throw error;
      
      // First check that data exists and has an id property
      // Notify administrator by email
      if (data && Array.isArray(data) && data.length > 0 && data[0] && 'id' in data[0]) {
        await supabase.functions.invoke('send-bug-report-notification', {
          body: {
            reportId: data[0].id,
            description,
            screenshotUrl,
            url: window.location.href,
            userId: user?.id || 'Utilisateur non connecté',
          }
        });
      } else {
        console.warn('Report created but data.id is not available');
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la soumission du rapport de bug:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitReport
  };
};
