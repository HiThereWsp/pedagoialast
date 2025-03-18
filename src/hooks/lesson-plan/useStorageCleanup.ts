
import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useBeforeUnload } from 'react-router-dom';
import { FORM_STORAGE_KEY, RESULT_STORAGE_KEY } from './types';

export function useStorageCleanup() {
  const location = useLocation();
  const isLessonPlanPage = location.pathname === '/lesson-plan';
  const intentionalUnloadRef = useRef(false);
  
  // Clear storage when user navigates away from the lesson plan page
  useEffect(() => {
    // Only setup cleanup when we're on the lesson plan page
    if (!isLessonPlanPage) return;
    
    return () => {
      // This runs when component unmounts (user navigates away)
      console.log('Navigating away from lesson plan page, clearing storage');
      localStorage.removeItem(FORM_STORAGE_KEY);
      localStorage.removeItem(RESULT_STORAGE_KEY);
    };
  }, [isLessonPlanPage]);

  // Handle page refresh scenarios
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (isLessonPlanPage) {
      // Mark this as an intentional refresh
      intentionalUnloadRef.current = true;
      
      // Clear data on intentional page refresh
      localStorage.removeItem(FORM_STORAGE_KEY);
      localStorage.removeItem(RESULT_STORAGE_KEY);
      
      // Standard beforeunload dialog (browser may or may not show it)
      e.preventDefault();
      e.returnValue = '';
    }
  }, [isLessonPlanPage]);

  // Setup beforeunload event listener
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  // Setup additional cleanup for when component unmounts during browser close
  useBeforeUnload(useCallback(() => {
    if (isLessonPlanPage) {
      localStorage.removeItem(FORM_STORAGE_KEY);
      localStorage.removeItem(RESULT_STORAGE_KEY);
    }
  }, [isLessonPlanPage]));
}
