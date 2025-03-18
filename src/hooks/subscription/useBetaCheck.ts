
import { supabase } from "@/integrations/supabase/client";

/**
 * Vérifie si un email est dans la liste des utilisateurs beta
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
      console.error('Erreur lors de la vérification du statut beta par email:', error);
      return false;
    }
    
    // Retourner true seulement si l'utilisateur existe ET est validé
    return !!data && !!data.is_validated;
  } catch (err) {
    console.error('Exception lors de la vérification du statut beta par email:', err);
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
