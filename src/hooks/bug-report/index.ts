
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useScreenshotCapture } from './useScreenshotCapture';
import { useReportSubmission } from './useReportSubmission';
import type { UseBugReportReturn } from './types';

export * from './types';

export const useBugReport = (): UseBugReportReturn => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  
  const {
    screenshot,
    setScreenshot,
    isCapturing,
    isUploading,
    captureScreenshot,
    uploadScreenshot,
  } = useScreenshotCapture();

  // Reset form function
  const resetForm = () => {
    setDescription('');
    setScreenshot(null);
  };

  const { isSubmitting, submissionError, submitReport } = useReportSubmission(
    user,
    screenshot,
    description,
    resetForm
  );

  return {
    description,
    setDescription,
    screenshot,
    isCapturing,
    isUploading,
    isSubmitting,
    submissionError,
    captureScreenshot,
    uploadScreenshot,
    submitReport,
    resetForm,
  };
};
