
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export async function checkBetaAccess(
  supabaseClient: SupabaseClient,
  user: { id: string; email: string }
) {
  console.log("Checking if user is beta user:", user.email);
  
  // Liste des domaines de courrier spécifiques qui doivent toujours avoir accès beta
  const specialBetaDomains = ['gmail.com', 'pedagogia.fr', 'gmail.fr', 'outlook.fr', 'outlook.com'];
  const specialBetaEmails = ['andyguitteaud@gmail.com']; // Emails spécifiques pour accès beta
  
  // Accorder un accès beta immédiat aux courriels spécifiques
  if (user.email && specialBetaEmails.includes(user.email)) {
    console.log('Email spécifique avec accès beta trouvé:', user.email);
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
    // NOUVELLE VÉRIFICATION: si le bêta-testeur est validé
    if (betaUser.is_validated) {
      console.log('Utilisateur beta validé trouvé dans la table beta_users:', user.email);
      return { 
        access: true, 
        type: 'beta',
        expires_at: null,
      };
    } else {
      console.log('Utilisateur beta non validé trouvé dans la table beta_users:', user.email);
      return {
        access: false,
        type: 'beta_pending',
        message: 'Accès beta en attente de validation'
      };
    }
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

  // NOUVEAU: vérifier si l'utilisateur est un ambassadeur
  console.log("Vérification du statut d'ambassadeur pour", user.email);
  
  // Vérifier d'abord dans ambassador_program
  const { data: ambassador, error: ambassadorError } = await supabaseClient
    .from('ambassador_program')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
    
  if (ambassadorError) {
    console.error("Erreur lors de la vérification du statut d'ambassadeur:", ambassadorError);
  }
  
  if (ambassador) {
    console.log('Ambassadeur trouvé dans ambassador_program:', ambassador);
    
    // Vérifier si l'accès ambassadeur est expiré
    if (ambassador.expires_at) {
      const expiryDate = new Date(ambassador.expires_at);
      if (expiryDate < new Date()) {
        console.log("Accès ambassadeur expiré le:", expiryDate, "pour", user.email);
        return { 
          access: false, 
          message: 'Accès ambassadeur expiré',
          type: 'ambassador',
          expires_at: ambassador.expires_at
        };
      }
    }
    
    return {
      access: true,
      type: 'ambassador',
      expires_at: ambassador.expires_at,
      ambassador_user: true
    };
  }
  
  // Vérifier aussi dans user_subscriptions pour type=ambassador
  const { data: ambassadorSub, error: ambassadorSubError } = await supabaseClient
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'ambassador')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  if (ambassadorSubError) {
    console.error("Erreur lors de la vérification de l'abonnement ambassadeur:", ambassadorSubError);
  }
  
  if (ambassadorSub) {
    console.log('Abonnement ambassadeur trouvé dans user_subscriptions pour', user.email);
    
    // Vérifier si l'abonnement ambassadeur est expiré
    if (ambassadorSub.expires_at) {
      const expiryDate = new Date(ambassadorSub.expires_at);
      if (expiryDate < new Date()) {
        console.log("Abonnement ambassadeur expiré le:", expiryDate, "pour", user.email);
        return { 
          access: false, 
          message: 'Accès ambassadeur expiré',
          type: 'ambassador',
          expires_at: ambassadorSub.expires_at
        };
      }
    }
    
    return {
      access: true,
      type: 'ambassador',
      expires_at: ambassadorSub.expires_at,
      ambassador_user: true
    };
  }
  
  // Rechercher dans le domaine de l'email pour un accès beta basé sur le domaine
  if (user.email) {
    const emailDomain = user.email.split('@')[1];
    if (specialBetaDomains.includes(emailDomain)) {
      console.log('Accès beta basé sur le domaine accordé pour:', user.email);
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
