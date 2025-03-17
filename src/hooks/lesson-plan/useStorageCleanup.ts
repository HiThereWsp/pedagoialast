
import { useCallback, useEffect } from 'react';
import { useLocation, useBeforeUnload } from 'react-router-dom';
import { FORM_STORAGE_KEY, RESULT_STORAGE_KEY } from './types';

export function useStorageCleanup() {
  const location = useLocation();
  
  // Handle intentional navigation away - clean storage when user explicitly navigates away
  useBeforeUnload(useCallback(() => {
    // Don't clear on page refresh (will be handled by beforeunload event)
    if (location.pathname !== '/lesson-plan') {
      localStorage.removeItem(FORM_STORAGE_KEY);
      localStorage.removeItem(RESULT_STORAGE_KEY);
    }
  }, [location]));

  // This effect prevents clearing localStorage on direct page visits or refreshes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // If it's a page refresh, do nothing (don't clear localStorage)
      // The data will be reloaded on page refresh
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
