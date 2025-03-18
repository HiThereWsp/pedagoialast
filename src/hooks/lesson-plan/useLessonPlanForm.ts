
import { useState, useCallback, useEffect, useRef } from 'react';
import { LessonPlanFormData, FORM_STORAGE_KEY, RESULT_STORAGE_KEY } from './types';

export function useLessonPlanForm() {
  const isInitialMount = useRef(true);
  const [formData, setFormData] = useState<LessonPlanFormData>(() => {
    // Initial form state
    const initialData = {
      classLevel: '',
      additionalInstructions: '',
      totalSessions: '',
      subject: '',
      subject_matter: '',
      text: '',
      lessonPlan: ''
    };
    
    try {
      // Only load saved form data on initial mount if it exists
      const savedFormData = localStorage.getItem(FORM_STORAGE_KEY);
      const savedResultData = localStorage.getItem(RESULT_STORAGE_KEY);
      
      if (savedFormData) {
        const parsedData = JSON.parse(savedFormData);
        Object.assign(initialData, parsedData);
      }
      
      if (savedResultData) {
        initialData.lessonPlan = savedResultData;
      }
    } catch (err) {
      console.error('Error loading saved form data:', err);
      // Continue with empty form on error
    }
    
    return initialData;
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    // Skip the first render to avoid overwriting with empty data
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    try {
      if (formData) {
        const dataToSave = { ...formData };
        delete dataToSave.lessonPlan; // Don't store result in form data
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
        
        // Store lesson plan separately
        if (formData.lessonPlan) {
          localStorage.setItem(RESULT_STORAGE_KEY, formData.lessonPlan);
        }
      }
    } catch (err) {
      console.error('Error saving form data:', err);
      // Continue even if saving fails
    }
  }, [formData]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const resetLessonPlan = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      lessonPlan: ''
    }));
    localStorage.removeItem(RESULT_STORAGE_KEY);
  }, []);

  const setLessonPlanResult = useCallback((lessonPlan: string) => {
    setFormData(prev => ({
      ...prev,
      lessonPlan
    }));
    localStorage.setItem(RESULT_STORAGE_KEY, lessonPlan);
  }, []);

  return {
    formData,
    handleInputChange,
    resetLessonPlan,
    setLessonPlanResult
  };
}
