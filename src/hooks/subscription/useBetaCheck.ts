import { supabase } from "@/integrations/supabase/client";

/**
 * Vérifie si un email est dans la liste des utilisateurs beta
 * Cette fonction est désormais redirigée vers le système de subscription
 */
export const checkBetaEmail = async (email: string): Promise<boolean> => {
  if (!email) return false;
  
  try {
    console.log(`Vérification de l'accès beta pour l'email: ${email}`);
    
    // Get the current authenticated user session to check if the email matches
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user;
    
    let userId: string | undefined;
    
    // If the email matches the current authenticated user, use their ID directly
    if (currentUser && currentUser.email?.toLowerCase() === email.toLowerCase()) {
      userId = currentUser.id;
      console.log(`Email corresponds to authenticated user with ID: ${userId}`);
    } else {
      // Otherwise, we need to try to find the user through other means
      // Since we can't directly query auth.users by email, we'll try our best with profiles table
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name')
        .like('first_name', `%${email}%`)
        .limit(5);
        
      if (profiles && profiles.length > 0) {
        userId = profiles[0].id;
        console.log(`Profile potentially matching found with ID: ${userId}`);
      } else {
        console.log(`No profile found matching the email: ${email}`);
        return false;
      }
    }
    
    if (!userId) {
      console.log(`No user ID found for the email: ${email}`);
      return false;
    }
    
    console.log(`Checking beta subscription for user ID: ${userId}`);
    
    // Check for beta subscription with the user ID
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id, status, expires_at')
      .eq('user_id', userId)
      .eq('type', 'beta')
      .eq('status', 'active')
      .maybeSingle();
    
    if (subError) {
      console.error('Error checking beta subscription:', subError);
      return false;
    }
    
    if (subscription) {
      console.log(`Active beta subscription found for ${email}:`, subscription);
      
      // Check if subscription has expiry date and if it's in the future
      if (subscription.expires_at) {
        const expiresAt = new Date(subscription.expires_at);
        const now = new Date();
        
        if (expiresAt < now) {
          console.log(`Beta subscription expired on ${expiresAt.toLocaleDateString()} for ${email}`);
          return false;
        }
      }
      
      return true;
    }
    
    console.log(`No beta subscription found for ${email}`);
    return false;
  } catch (err) {
    console.error('Exception when checking beta status:', err);
    return false;
  }
};

/**
 * Alternative implementation that first gets the user ID then checks subscription
 * Use this if the subquery approach above causes issues
 */
export const checkBetaEmailAlternate = async (email: string): Promise<boolean> => {
  if (!email) return false;
  
  try {
    console.log(`Alternative verification of beta access for email: ${email}`);
    
    // Get the current authenticated user session
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user;
    
    let userId: string | undefined;
    
    // If the email matches the current user, we can use their ID directly
    if (currentUser && currentUser.email?.toLowerCase() === email.toLowerCase()) {
      userId = currentUser.id;
      console.log(`Currently authenticated user found: ${userId}`);
    } else {
      // Fallback to trying to find the user by matching first name that might contain the email
      // This is a heuristic approach and not reliable
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name')
        .like('first_name', `%${email}%`)
        .limit(5);
        
      if (profiles && profiles.length > 0) {
        userId = profiles[0].id;
        console.log(`Profile potentially matching found with ID: ${userId}`);
      }
    }
    
    if (!userId) {
      console.log(`No profile found for email (alternative method): ${email}`);
      return false;
    }
    
    console.log(`Profile found (alternative method) with ID: ${userId}`);
    
    // Then check for beta subscription with the user ID
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id, status, expires_at')
      .eq('user_id', userId)
      .eq('type', 'beta')
      .eq('status', 'active')
      .maybeSingle();
    
    if (subError) {
      console.error('Error checking alternative beta subscription:', subError);
      return false;
    }
    
    if (subscription) {
      console.log(`Active beta subscription found (alternative method) for ${email}`);
      return true;
    }
    
    console.log(`No beta subscription found (alternative method) for ${email}`);
    return false;
  } catch (err) {
    console.error('Exception when checking alternative beta status:', err);
    return false;
  }
};

/**
 * Vérifie si un utilisateur doit voir le message de bienvenue beta
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
    
    // Si l'enregistrement existe et que le message n'a pas été envoyé, on doit afficher le message
    return !!data && !data.message_sent;
  } catch (err) {
    console.error('Exception when checking beta welcome message:', err);
    return false;
  }
};

/**
 * Marque le message de bienvenue comme envoyé
 */
export const markBetaWelcomeMessageAsSent = async (userId: string): Promise<void> => {
  if (!userId) return;
  
  try {
    const { error } = await supabase
      .from('beta_welcome_messages')
      .update({ message_sent: true })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error marking welcome message as sent:', error);
    }
  } catch (err) {
    console.error('Exception when marking welcome message as sent:', err);
  }
};
