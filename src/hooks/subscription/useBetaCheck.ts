
import { supabase } from "@/integrations/supabase/client";

/**
 * Vérifie si un email est dans la liste des utilisateurs beta
 * Cette fonction est désormais redirigée vers le système de subscription
 */
export const checkBetaEmail = async (email: string): Promise<boolean> => {
  if (!email) return false;
  
  try {
    // Get user by email from profiles table with explicit type
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    
    if (userError || !userData) {
      console.log('Utilisateur non trouvé par email:', email);
      return false;
    }
    
    // Vérifier si l'utilisateur a un abonnement beta actif avec type explicite
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userData.id)
      .eq('type', 'beta')
      .eq('status', 'active')
      .maybeSingle();
    
    if (error) {
      console.error('Erreur lors de la vérification du statut beta par abonnement:', error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error('Exception lors de la vérification du statut beta:', err);
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
