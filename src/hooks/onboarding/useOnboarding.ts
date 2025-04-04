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
import { supabase } from "@/lib/supabase";

export const useOnboarding = () => {
  const { user } = useAuth();
  const [completedTasks, setCompletedTasks] = useState<boolean[]>(Array(TOTAL_TASKS).fill(false));
  const [isAllCompleted, setIsAllCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasBeenShown, setHasBeenShown] = useState(false);

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

  // Vérifier si l'onboarding a déjà été montré
  useEffect(() => {
    const checkOnboardingShown = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('onboarding_shown')
          .eq('user_id', user.id)
          .single();
          
        if (data) {
          setHasBeenShown(data.onboarding_shown);
        }
      } catch (error) {
        console.error('Error checking onboarding shown status:', error);
      }
    };

    checkOnboardingShown();
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

  // Marquer l'onboarding comme montré
  const markAsShown = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('user_profiles')
        .update({ onboarding_shown: true })
        .eq('user_id', user.id);
        
      setHasBeenShown(true);
    } catch (error) {
      console.error('Error marking onboarding as shown:', error);
    }
  };

  return {
    completedTasks,
    toggleTask,
    isAllCompleted,
    markAllCompleted,
    isLoading,
    hasBeenShown,
    markAsShown
  };
};
