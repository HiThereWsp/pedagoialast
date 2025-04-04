
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

// Number of onboarding tasks
export const TOTAL_TASKS = 6;

// Save onboarding state to localStorage and database
export const saveOnboardingState = async (
  tasks: boolean[], 
  completed: boolean, 
  user: User | null
) => {
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

// Load onboarding state from localStorage
export const loadFromLocalStorage = () => {
  try {
    const savedTasks = localStorage.getItem('onboarding_tasks');
    const completedStatus = localStorage.getItem('onboarding_completed');
    
    return {
      tasks: savedTasks ? JSON.parse(savedTasks) : null,
      completed: completedStatus ? JSON.parse(completedStatus) : null
    };
  } catch (error) {
    console.error('Error loading onboarding state from localStorage:', error);
    return { tasks: null, completed: null };
  }
};

// Fetch onboarding status from database
export const fetchOnboardingStatus = async (user: User) => {
  try {
    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('onboarding_completed, onboarding_tasks')
      .eq('user_id', user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }
    
    return profileData;
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return null;
  }
};
