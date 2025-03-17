
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export async function checkBetaAccess(
  supabaseClient: SupabaseClient,
  user: { id: string; email: string }
) {
  console.log("Checking if user is beta user:", user.email);
  
  // Lista de dominios de correo específicos que siempre deben tener acceso beta
  const specialBetaDomains = ['gmail.com', 'pedagogia.fr', 'gmail.fr', 'outlook.fr', 'outlook.com'];
  const specialBetaEmails = ['andyguitteaud@gmail.com']; // Add specific emails for beta access
  
  // Concede acceso beta inmediato a correos específicos
  if (specialBetaEmails.includes(user.email)) {
    console.log('Correo específico con acceso beta encontrado:', user.email);
    return { 
      access: true, 
      type: 'beta',
      expires_at: null,
      special_access: true
    };
  }
  
  // Première méthode: Vérifier dans la table beta_users
  const { data: betaUser, error: betaError } = await supabaseClient
    .from('beta_users')
    .select('*')
    .eq('email', user.email)
    .single();
    
  if (betaError && betaError.code !== 'PGRST116') {
    console.error("Beta user check error:", betaError);
  }
    
  if (betaUser) {
    console.log('Utilisateur beta trouvé dans la table beta_users:', user.email);
    return { 
      access: true, 
      type: 'beta',
      expires_at: null,
    };
  }

  // Deuxième méthode: Vérifier dans user_subscriptions avec type=beta
  console.log("Checking beta subscription in user_subscriptions for", user.email);
  const { data: betaSubscription, error: betaSubError } = await supabaseClient
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'beta')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (betaSubError) {
    console.error("Beta subscription check error:", betaSubError);
    return { 
      access: false, 
      message: `Erreur lors de la vérification de l'abonnement beta: ${betaSubError.message}`,
      type: 'error'
    };
  }

  if (betaSubscription) {
    console.log('Abonnement beta trouvé dans user_subscriptions pour', user.email, ':', betaSubscription);
    
    // Vérifier si l'abonnement beta est expiré
    if (betaSubscription.expires_at) {
      const expiryDate = new Date(betaSubscription.expires_at);
      if (expiryDate < new Date()) {
        console.log("Beta subscription expired at:", expiryDate, "for", user.email);
        return { 
          access: false, 
          message: 'Accès beta expiré',
          type: 'beta',
          expires_at: betaSubscription.expires_at
        };
      }
    }
    
    console.log("Active beta subscription found, granting access to", user.email);
    return { 
      access: true, 
      type: 'beta',
      expires_at: betaSubscription.expires_at,
      promo_code: betaSubscription.promo_code,
      beta_user: true
    };
  }
  
  // Search in the email domain for special domain-based beta access
  if (user.email) {
    const emailDomain = user.email.split('@')[1];
    if (specialBetaDomains.includes(emailDomain)) {
      console.log('Domain-based beta access granted for:', user.email);
      return { 
        access: true, 
        type: 'beta',
        expires_at: null,
        domain_access: true
      };
    }
  }
  
  console.log("No beta access found for", user.email);
  return null;
}
