
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an email is in the beta_users table with is_validated=true
 */
export const checkBetaEmail = async (email: string): Promise<boolean> => {
  if (!email) return false;
  
  try {
    const { data, error } = await supabase
      .from('beta_users')
      .select('id, is_validated')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    
    if (error) {
      console.error('Error checking beta status by email:', error);
      return false;
    }
    
    // Return true only if the user exists AND is validated
    return !!data && !!data.is_validated;
  } catch (err) {
    console.error('Exception checking beta status by email:', err);
    return false;
  }
};

/**
 * Check if a user should see the beta welcome message
 */
export const checkBetaWelcomeMessage = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('beta_welcome_messages')
      .select('message_sent')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking beta welcome message:', error);
      return false;
    }
    
    // If the record exists and the message hasn't been sent, we need to display the message
    return !!data && !data.message_sent;
  } catch (err) {
    console.error('Exception checking beta welcome message:', err);
    return false;
  }
};

/**
 * Mark the beta welcome message as sent
 */
export const markBetaWelcomeMessageAsSent = async (userId: string): Promise<void> => {
  if (!userId) return;
  
  try {
    const { error } = await supabase
      .from('beta_welcome_messages')
      .update({ message_sent: true })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error marking beta welcome message as sent:', error);
    }
  } catch (err) {
    console.error('Exception marking beta welcome message as sent:', err);
  }
};
