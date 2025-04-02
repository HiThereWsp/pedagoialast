
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  TOTAL_TASKS, 
  saveOnboardingState, 
  loadFromLocalStorage,
  fetchOnboardingStatus 
} from "./onboardingStorage";
import { setupEventListeners } from "./onboardingEvents";
import { showCompletionCelebration } from "./celebrationEffects";

export const useOnboarding = () => {
  const { user } = useAuth();
  const [completedTasks, setCompletedTasks] = useState<boolean[]>(Array(TOTAL_TASKS).fill(false));
  const [isAllCompleted, setIsAllCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if all tasks are completed
  useEffect(() => {
    setIsAllCompleted(completedTasks.every(Boolean));
  }, [completedTasks]);

  // Load onboarding state from local storage when no user is available
  useEffect(() => {
    if (!user) {
      const { tasks, completed } = loadFromLocalStorage();
      
      if (tasks) {
        setCompletedTasks(tasks);
      }
      
      if (completed !== null) {
        setIsAllCompleted(completed);
      }
      
      setIsLoading(false);
    }
  }, [user]);

  // Load onboarding state from database when user is available
  useEffect(() => {
    const loadOnboardingData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const profileData = await fetchOnboardingStatus(user);
          
        // If we have onboarding data, use it
        if (profileData) {
          if (profileData.onboarding_tasks) {
            setCompletedTasks(profileData.onboarding_tasks);
          }
          
          if (profileData.onboarding_completed !== null && 
              profileData.onboarding_completed !== undefined) {
            setIsAllCompleted(profileData.onboarding_completed);
          }
        } else {
          // Fallback to localStorage if database fetch fails
          const { tasks, completed } = loadFromLocalStorage();
          
          if (tasks) {
            setCompletedTasks(tasks);
          }
          
          if (completed !== null) {
            setIsAllCompleted(completed);
          }
        }
      } catch (error) {
        console.error('Error fetching onboarding status:', error);
        
        // Fallback to localStorage
        const { tasks, completed } = loadFromLocalStorage();
        
        if (tasks) {
          setCompletedTasks(tasks);
        }
        
        if (completed !== null) {
          setIsAllCompleted(completed);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingData();
  }, [user]);

  // Toggle a specific task
  const toggleTask = (index: number) => {
    const newCompletedTasks = [...completedTasks];
    newCompletedTasks[index] = !newCompletedTasks[index];
    setCompletedTasks(newCompletedTasks);
    
    const allCompleted = newCompletedTasks.every(Boolean);
    setIsAllCompleted(allCompleted);
    
    saveOnboardingState(newCompletedTasks, allCompleted, user);
    
    if (allCompleted && !isAllCompleted) {
      showCompletionCelebration();
    }
  };

  // Mark all tasks as completed
  const markAllCompleted = () => {
    const allCompleted = Array(TOTAL_TASKS).fill(true);
    setCompletedTasks(allCompleted);
    setIsAllCompleted(true);
    saveOnboardingState(allCompleted, true, user);
  };

  // Setup event listeners for auto-completion
  useEffect(() => {
    const cleanup = setupEventListeners(completedTasks, toggleTask);
    return cleanup;
  }, [completedTasks]);

  return {
    completedTasks,
    toggleTask,
    isAllCompleted,
    markAllCompleted,
    isLoading
  };
};
