
import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

export const useScreenshotCapture = () => {
  const [screenshot, setScreenshot] = useState<string | File | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Creation of a hidden file input element for image upload
  useEffect(() => {
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
  }, []);

  // Automatic screenshot capture with html2canvas
  const captureScreenshot = async () => {
    try {
      setIsCapturing(true);
      
      // Temporarily hide the bug report button during capture
      const bugReportButton = document.querySelector('.bug-report-button') as HTMLElement;
      if (bugReportButton) bugReportButton.style.display = 'none';
      
      const canvas = await html2canvas(document.body);
      
      // Restore the button
      if (bugReportButton) bugReportButton.style.display = '';
      
      const dataUrl = canvas.toDataURL('image/png');
      setScreenshot(dataUrl);
    } catch (error) {
      console.error('Erreur lors de la capture d\'écran:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  // Manual screenshot upload
  const uploadScreenshot = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return {
    screenshot,
    setScreenshot,
    isCapturing,
    isUploading,
    setIsUploading,
    captureScreenshot,
    uploadScreenshot,
  };
};
