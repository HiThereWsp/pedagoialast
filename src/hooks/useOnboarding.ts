
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { UserProfileRow } from "@/types/database/tables";

// Number of onboarding tasks
const TOTAL_TASKS = 6;

export const useOnboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [completedTasks, setCompletedTasks] = useState<boolean[]>(Array(TOTAL_TASKS).fill(false));
  const [isAllCompleted, setIsAllCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if all tasks are completed
  useEffect(() => {
    setIsAllCompleted(completedTasks.every(Boolean));
  }, [completedTasks]);

  // Load onboarding state from local storage when no user is available
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        const savedTasks = localStorage.getItem('onboarding_tasks');
        if (savedTasks) {
          setCompletedTasks(JSON.parse(savedTasks));
        }
        
        const completedStatus = localStorage.getItem('onboarding_completed');
        if (completedStatus) {
          setIsAllCompleted(JSON.parse(completedStatus));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading onboarding state from localStorage:', error);
        setIsLoading(false);
      }
    };

    if (!user) {
      loadFromLocalStorage();
    }
  }, [user]);

  // Load onboarding state from database when user is available
  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get user profile first
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('onboarding_completed, onboarding_tasks')
          .eq('user_id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          loadFromLocalStorage();
          return;
        }
        
        // If we have onboarding data, use it
        if (profileData) {
          if (profileData.onboarding_tasks) {
            setCompletedTasks(profileData.onboarding_tasks);
          }
          
          if (profileData.onboarding_completed !== null && profileData.onboarding_completed !== undefined) {
            setIsAllCompleted(profileData.onboarding_completed);
          }
        }
        
      } catch (error) {
        console.error('Error fetching onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadFromLocalStorage = () => {
      try {
        const savedTasks = localStorage.getItem('onboarding_tasks');
        if (savedTasks) {
          setCompletedTasks(JSON.parse(savedTasks));
        }
        
        const completedStatus = localStorage.getItem('onboarding_completed');
        if (completedStatus) {
          setIsAllCompleted(JSON.parse(completedStatus));
        }
      } catch (error) {
        console.error('Error loading onboarding state from localStorage:', error);
      }
    };

    fetchOnboardingStatus();
  }, [user]);

  // Save onboarding state to localStorage and database
  const saveOnboardingState = async (tasks: boolean[], completed: boolean) => {
    // Save to localStorage first (works for all users)
    localStorage.setItem('onboarding_tasks', JSON.stringify(tasks));
    localStorage.setItem('onboarding_completed', JSON.stringify(completed));
    
    // If user is logged in, save to database
    if (user) {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            onboarding_tasks: tasks,
            onboarding_completed: completed
          })
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error saving onboarding status:', error);
        }
      } catch (error) {
        console.error('Exception saving onboarding status:', error);
      }
    }
  };

  // Toggle a specific task
  const toggleTask = (index: number) => {
    const newCompletedTasks = [...completedTasks];
    newCompletedTasks[index] = !newCompletedTasks[index];
    setCompletedTasks(newCompletedTasks);
    
    const allCompleted = newCompletedTasks.every(Boolean);
    setIsAllCompleted(allCompleted);
    
    saveOnboardingState(newCompletedTasks, allCompleted);
    
    if (allCompleted && !isAllCompleted) {
      // Show toast for completing all tasks
      toast({
        title: "Félicitations !",
        description: "Vous avez complété toutes les étapes d'onboarding !",
      });
    }
  };

  // Mark all tasks as completed
  const markAllCompleted = () => {
    const allCompleted = Array(TOTAL_TASKS).fill(true);
    setCompletedTasks(allCompleted);
    setIsAllCompleted(true);
    saveOnboardingState(allCompleted, true);
  };

  // Setup event listeners for auto-completion
  useEffect(() => {
    const handleSequenceCreated = () => {
      if (!completedTasks[0]) toggleTask(0);
    };
    
    const handleExerciseCreated = () => {
      if (!completedTasks[1]) toggleTask(1);
    };
    
    const handleDifferentiationCreated = () => {
      if (!completedTasks[2]) toggleTask(2);
    };
    
    const handleCorrespondenceCreated = () => {
      if (!completedTasks[3]) toggleTask(3);
    };
    
    const handleImageCreated = () => {
      if (!completedTasks[4]) toggleTask(4);
    };
    
    const handleFeatureRequested = () => {
      if (!completedTasks[5]) toggleTask(5);
    };
    
    // Add event listeners
    window.addEventListener('pedagoia:sequenceCreated', handleSequenceCreated);
    window.addEventListener('pedagoia:exerciseCreated', handleExerciseCreated);
    window.addEventListener('pedagoia:differentiationCreated', handleDifferentiationCreated);
    window.addEventListener('pedagoia:correspondenceCreated', handleCorrespondenceCreated);
    window.addEventListener('pedagoia:imageCreated', handleImageCreated);
    window.addEventListener('pedagoia:featureRequested', handleFeatureRequested);
    
    // Cleanup
    return () => {
      window.removeEventListener('pedagoia:sequenceCreated', handleSequenceCreated);
      window.removeEventListener('pedagoia:exerciseCreated', handleExerciseCreated);
      window.removeEventListener('pedagoia:differentiationCreated', handleDifferentiationCreated);
      window.removeEventListener('pedagoia:correspondenceCreated', handleCorrespondenceCreated);
      window.removeEventListener('pedagoia:imageCreated', handleImageCreated);
      window.removeEventListener('pedagoia:featureRequested', handleFeatureRequested);
    };
  }, [completedTasks, toggleTask]);

  return {
    completedTasks,
    toggleTask,
    isAllCompleted,
    markAllCompleted,
    isLoading
  };
};
