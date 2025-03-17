
import { useState, useCallback, useEffect } from 'react';
import { LessonPlanFormData, FORM_STORAGE_KEY, RESULT_STORAGE_KEY } from './types';

export function useLessonPlanForm() {
  const [formData, setFormData] = useState<LessonPlanFormData>(() => {
    // Load saved form data from localStorage on initial mount
    const savedFormData = localStorage.getItem(FORM_STORAGE_KEY);
    const savedResultData = localStorage.getItem(RESULT_STORAGE_KEY);
    
    const initialData = {
      classLevel: '',
      additionalInstructions: '',
      totalSessions: '',
      subject: '',
      subject_matter: '',
      text: '',
      lessonPlan: ''
    };
    
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      Object.assign(initialData, parsedData);
    }
    
    if (savedResultData) {
      initialData.lessonPlan = savedResultData;
    }
    
    return initialData;
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (formData) {
      const dataToSave = { ...formData };
      delete dataToSave.lessonPlan; // Don't store result in form data
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
      
      // Store lesson plan separately
      if (formData.lessonPlan) {
        localStorage.setItem(RESULT_STORAGE_KEY, formData.lessonPlan);
      }
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
