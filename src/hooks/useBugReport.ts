
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import html2canvas from 'html2canvas';
import { v4 as uuidv4 } from 'uuid';

export interface BugReport {
  id?: string;
  user_id?: string;
  description: string;
  screenshot_url?: string;
  browser_info?: string;
  url?: string;
  status?: 'new' | 'in_progress' | 'resolved';
  created_at?: string;
}

export const useBugReport = () => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<string | File | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Création d'un élément input file caché pour l'upload d'image
  useState(() => {
    if (typeof document !== 'undefined' && !fileInputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setScreenshot(file);
        }
      };
      document.body.appendChild(input);
      fileInputRef.current = input;
    }

    return () => {
      if (fileInputRef.current && document.body.contains(fileInputRef.current)) {
        document.body.removeChild(fileInputRef.current);
      }
    };
  });

  // Capture d'écran automatique avec html2canvas
  const captureScreenshot = async () => {
    try {
      setIsCapturing(true);
      
      // Masquer temporairement le bouton de rapport de bug pendant la capture
      const bugReportButton = document.querySelector('.bug-report-button') as HTMLElement;
      if (bugReportButton) bugReportButton.style.display = 'none';
      
      const canvas = await html2canvas(document.body);
      
      // Restaurer le bouton
      if (bugReportButton) bugReportButton.style.display = '';
      
      const dataUrl = canvas.toDataURL('image/png');
      setScreenshot(dataUrl);
    } catch (error) {
      console.error('Erreur lors de la capture d\'écran:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  // Upload manuel d'une capture d'écran
  const uploadScreenshot = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Soumission du rapport de bug
  const submitReport = async () => {
    try {
      setIsSubmitting(true);
      
      let screenshotUrl: string | undefined;
      
      // Si une capture d'écran est présente, l'upload sur Supabase Storage
      if (screenshot) {
        const fileName = `bug-reports/${uuidv4()}-${Date.now()}.png`;
        
        if (typeof screenshot === 'string' && screenshot.startsWith('data:image')) {
          // Convertir le dataURL en blob pour l'upload
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
          // Upload direct du fichier
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
      
      // Collecter des informations sur le navigateur et l'environnement
      const browserInfo = JSON.stringify({
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        platform: navigator.platform,
        language: navigator.language,
      });
      
      // Créer le rapport de bug dans la base de données
      const bugReport: BugReport = {
        user_id: user?.id,
        description,
        screenshot_url: screenshotUrl,
        browser_info: browserInfo,
        url: window.location.href,
        status: 'new',
      };
      
      const { data, error } = await supabase
        .from('bug_reports')
        .insert(bugReport)
        .select()
        .single();
        
      if (error) throw error;
      
      // Notifier l'administrateur par email
      await supabase.functions.invoke('send-bug-report-notification', {
        body: {
          reportId: data.id,
          description,
          screenshotUrl,
          url: window.location.href,
          userId: user?.id || 'Utilisateur non connecté',
        }
      });
      
      // Réinitialiser le formulaire après la soumission
      resetForm();
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la soumission du rapport de bug:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Réinitialisation du formulaire
  const resetForm = () => {
    setDescription('');
    setScreenshot(null);
  };

  return {
    description,
    setDescription,
    screenshot,
    isCapturing,
    isUploading,
    isSubmitting,
    captureScreenshot,
    uploadScreenshot,
    submitReport,
    resetForm,
  };
};
