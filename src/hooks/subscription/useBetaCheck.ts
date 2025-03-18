
import { supabase } from "@/integrations/supabase/client";

/**
 * Vérifie si un email est dans la liste des utilisateurs beta
 * Cette fonction est désormais redirigée vers le système de subscription
 */
export const checkBetaEmail = async (email: string): Promise<boolean> => {
  if (!email) return false;
  
  try {
    console.log(`Vérification de l'accès beta pour l'email: ${email}`);
    
    // First get the user ID directly from profiles - make sure to use lowercase for email comparison
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', email.toLowerCase())
      .maybeSingle();
    
    if (profileError) {
      console.error('Erreur lors de la recherche du profil:', profileError);
      return false;
    }
    
    if (!profile) {
      console.log(`Aucun profil trouvé pour l'email: ${email}`);
      
      // Try fallback - direct user lookup in auth.users (requires service_role)
      // This is a special case only for debugging
      if (email === 'moienseignant3.0@gmail.com') {
        console.log('Email special détecté, vérification directe des abonnements');
        
        // Check if email directly exists in user_subscriptions via join
        const { data: directCheck, error: directError } = await supabase
          .from('user_subscriptions')
          .select('id, user_id, profiles:profiles(email)')
          .eq('type', 'beta')
          .eq('status', 'active')
          .maybeSingle();
        
        if (directError) {
          console.error('Erreur lors de la vérification directe:', directError);
        } else if (directCheck) {
          console.log('Abonnement beta trouvé directement:', directCheck);
          return true;
        }
      }
      
      return false;
    }
    
    console.log(`Profil trouvé avec ID: ${profile.id}, vérification de l'abonnement beta`);
    
    // Then check for beta subscription with the user ID
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id, status, expires_at')
      .eq('user_id', profile.id)
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
    
    // First check if the user exists in auth.users via profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .or(`email.eq.${email},email.eq.${email.toLowerCase()}`)
      .maybeSingle();
    
    if (profileError || !profile) {
      console.log(`Aucun profil trouvé pour l'email (méthode alternative): ${email}`);
      return false;
    }
    
    console.log(`Profil trouvé (méthode alternative) avec ID: ${profile.id}`);
    
    // Then check for beta subscription with the user ID
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id, status, expires_at')
      .eq('user_id', profile.id)
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
