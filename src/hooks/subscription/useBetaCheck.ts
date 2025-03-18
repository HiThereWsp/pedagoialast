import { supabase } from "@/integrations/supabase/client";

/**
 * Vérifie si un email est dans la liste des utilisateurs beta
 * Cette fonction est désormais redirigée vers le système de subscription
 */
export const checkBetaEmail = async (email: string): Promise<boolean> => {
  if (!email) return false;
  
  try {
    console.log(`Vérification de l'accès beta pour l'email: ${email}`);
    
    // First get the user ID directly from profiles - note that email is not stored in profiles
    // but in auth.users which we cannot directly query from client
    // Let's query by matching the email to the user's auth account
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError) {
      console.error('Erreur lors de la recherche du profil par email:', userError);
      return false;
    }
    
    if (!user?.user) {
      console.log(`Aucun utilisateur trouvé pour l'email: ${email}`);
      return false;
    }
    
    const userId = user.user.id;
    console.log(`Utilisateur trouvé avec ID: ${userId}, vérification de l'abonnement beta`);
    
    // Then check for beta subscription with the user ID
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id, status, expires_at')
      .eq('user_id', userId)
      .eq('type', 'beta')
      .eq('status', 'active')
      .maybeSingle();
    
    if (subError) {
      console.error('Erreur lors de la vérification de l\'abonnement beta:', subError);
      return false;
    }
    
    if (subscription) {
      console.log(`Abonnement beta actif trouvé pour ${email}:`, subscription);
      
      // Check if subscription has expiry date and if it's in the future
      if (subscription.expires_at) {
        const expiresAt = new Date(subscription.expires_at);
        const now = new Date();
        
        if (expiresAt < now) {
          console.log(`Abonnement beta expiré le ${expiresAt.toLocaleDateString()} pour ${email}`);
          return false;
        }
      }
      
      return true;
    }
    
    console.log(`Aucun abonnement beta trouvé pour ${email}`);
    return false;
  } catch (err) {
    console.error('Exception lors de la vérification du statut beta:', err);
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
    console.log(`Vérification alternative de l'accès beta pour l'email: ${email}`);
    
    // Get the current authenticated user session
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user;
    
    let userId: string | undefined;
    
    // If the email matches the current user, we can use their ID directly
    if (currentUser && currentUser.email?.toLowerCase() === email.toLowerCase()) {
      userId = currentUser.id;
      console.log(`Utilisateur actuellement connecté trouvé: ${userId}`);
    } else {
      // Otherwise, we need to try to find the user a different way
      // This is an admin-only endpoint and won't work for regular users
      try {
        const { data: userData } = await supabase.auth.admin.getUserByEmail(email);
        userId = userData?.user?.id;
        console.log(`Utilisateur trouvé via admin API: ${userId}`);
      } catch (adminError) {
        console.log('API admin non disponible, utilisation de la méthode de recherche par profil');
        
        // Fallback to trying to find the user by matching first name that might contain the email
        // This is a heuristic approach and not reliable
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name')
          .like('first_name', `%${email}%`)
          .limit(5);
          
        if (profiles && profiles.length > 0) {
          userId = profiles[0].id;
          console.log(`Profil potentiellement correspondant trouvé avec ID: ${userId}`);
        }
      }
    }
    
    if (!userId) {
      console.log(`Aucun profil trouvé pour l'email (méthode alternative): ${email}`);
      return false;
    }
    
    console.log(`Profil trouvé (méthode alternative) avec ID: ${userId}`);
    
    // Then check for beta subscription with the user ID
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id, status, expires_at')
      .eq('user_id', userId)
      .eq('type', 'beta')
      .eq('status', 'active')
      .maybeSingle();
    
    if (subError) {
      console.error('Erreur lors de la vérification alternative de l\'abonnement beta:', subError);
      return false;
    }
    
    if (subscription) {
      console.log(`Abonnement beta actif trouvé (méthode alternative) pour ${email}`);
      return true;
    }
    
    console.log(`Aucun abonnement beta trouvé (méthode alternative) pour ${email}`);
    return false;
  } catch (err) {
    console.error('Exception lors de la vérification alternative du statut beta:', err);
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
      console.error('Erreur lors de la vérification du message de bienvenue beta:', error);
      return false;
    }
    
    // Si l'enregistrement existe et que le message n'a pas été envoyé, on doit afficher le message
    return !!data && !data.message_sent;
  } catch (err) {
    console.error('Exception lors de la vérification du message de bienvenue beta:', err);
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
      console.error('Erreur lors du marquage du message de bienvenue comme envoyé:', error);
    }
  } catch (err) {
    console.error('Exception lors du marquage du message de bienvenue comme envoyé:', err);
  }
};
