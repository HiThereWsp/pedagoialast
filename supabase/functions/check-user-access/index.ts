
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { checkBetaAccess } from "./beta-access.ts";

// Headers CORS explicites et complets
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

// Fonction pour authentifier l'utilisateur
async function authenticateUser(supabaseClient, authHeader) {
  if (!authHeader) {
    console.log("No Authorization header found");
    return {
      error: true,
      status: 401,
      body: {
        access: false, 
        message: 'Non authentifié'
      }
    };
  }
  
  const token = authHeader.replace('Bearer ', '');
  console.log("Token extracted from Authorization header");
  
  // Check user
  console.log("Checking user with token");
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
  
  if (userError) {
    console.error("User error:", userError);
    return {
      error: true,
      status: 401,
      body: {
        access: false, 
        message: 'Utilisateur non trouvé',
        error: userError.message
      }
    };
  }
  
  if (!user) {
    console.log("No user found");
    return {
      error: true,
      status: 401,
      body: {
        access: false, 
        message: 'Utilisateur non trouvé'
      }
    };
  }
  
  console.log("User found:", user.email);
  return { error: false, user };
}

// Fonction pour vérifier le mode développement
function checkDevelopmentMode(environment) {
  if (environment === 'development') {
    console.log("Development environment detected, granting access");
    return { 
      access: true, 
      type: 'dev_mode',
      expires_at: null,
      message: 'Accès accordé en mode développement'
    };
  }
  
  return null;
}

// Fonction pour vérifier l'accès payant
async function checkPaidAccess(supabaseClient, user) {
  console.log("Checking paid subscription for user:", user.email);
  
  try {
    const { data: paidSubscription, error: paidSubError } = await supabaseClient
      .from('user_subscriptions')
      .select('status, type, expires_at, promo_code')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('type', 'paid')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (paidSubError) {
      console.error("Paid subscription check error:", paidSubError);
    }
    
    if (paidSubscription) {
      console.log('Abonnement payant trouvé pour', user.email, ':', paidSubscription);
      
      // Vérifier si l'abonnement est expiré
      if (paidSubscription.expires_at) {
        const expiryDate = new Date(paidSubscription.expires_at);
        if (expiryDate < new Date()) {
          console.log("Paid subscription expired at:", expiryDate, "for", user.email);
          return { 
            access: false, 
            message: 'Abonnement expiré',
            type: paidSubscription.type,
            expires_at: paidSubscription.expires_at
          };
        }
      }
      
      console.log("Active paid subscription found, granting access to", user.email);
      return { 
        access: true, 
        type: paidSubscription.type,
        expires_at: paidSubscription.expires_at,
        promo_code: paidSubscription.promo_code
      };
    }
    
    return null;
  } catch (err) {
    console.error("Error in checkPaidAccess:", err);
    return null;
  }
}

// Fonction pour vérifier l'accès d'essai
async function checkTrialAccess(supabaseClient, user) {
  console.log("Checking trial subscription for user:", user.email);
  
  try {
    const { data: trialSubscription, error: trialSubError } = await supabaseClient
      .from('user_subscriptions')
      .select('status, type, expires_at, promo_code')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('type', 'trial')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (trialSubError) {
      console.error("Trial subscription check error:", trialSubError);
    }
    
    if (trialSubscription) {
      console.log('Abonnement d\'essai trouvé pour', user.email, ':', trialSubscription);
      
      // Vérifier si l'essai est expiré
      if (trialSubscription.expires_at) {
        const expiryDate = new Date(trialSubscription.expires_at);
        if (expiryDate < new Date()) {
          console.log("Trial subscription expired at:", expiryDate, "for", user.email);
          return { 
            access: false, 
            message: 'Période d\'essai expirée',
            type: trialSubscription.type,
            expires_at: trialSubscription.expires_at
          };
        }
      }
      
      console.log("Active trial subscription found, granting access to", user.email);
      return { 
        access: true, 
        type: trialSubscription.type,
        expires_at: trialSubscription.expires_at,
        promo_code: trialSubscription.promo_code
      };
    }
    
    return null;
  } catch (err) {
    console.error("Error in checkTrialAccess:", err);
    return null;
  }
}

// Fonction pour créer une réponse formatée
function createResponse(body, status = 200) {
  return new Response(
    JSON.stringify(body),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status
    }
  );
}

// Point d'entrée principal de l'Edge Function
serve(async (req) => {
  // Gérer les requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    console.log("Starting check-user-access function");
    
    // Obtenir le token d'authentification
    const authHeader = req.headers.get('Authorization');
    
    // Initialiser le client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );
    console.log("Supabase client initialized");

    // Authentifier l'utilisateur
    const authResult = await authenticateUser(supabaseClient, authHeader);
    if (authResult.error) {
      console.log("Authentication error:", authResult.body);
      return createResponse(authResult.body, authResult.status);
    }
    
    const user = authResult.user;
    console.log("Authenticated user:", user.email);

    // Vérifier le mode développement
    const devModeResult = checkDevelopmentMode(Deno.env.get('ENVIRONMENT'));
    if (devModeResult) {
      console.log("Development mode detected, granting access");
      return createResponse(devModeResult);
    }

    // Vérifier l'accès dans l'ordre de priorité: Beta -> Paid -> Trial
    
    // 1. Vérifier l'accès beta (PRIORITÉ LA PLUS HAUTE)
    console.log("Checking beta access for", user.email);
    const betaResult = await checkBetaAccess(supabaseClient, user);
    if (betaResult) {
      console.log("Beta access result for", user.email, ":", betaResult);
      return createResponse(betaResult);
    }

    // 2. Vérifier l'abonnement payant (SECONDE PRIORITÉ)
    console.log("Checking paid access for", user.email);
    const paidResult = await checkPaidAccess(supabaseClient, user);
    if (paidResult) {
      console.log("Paid access result for", user.email, ":", paidResult);
      return createResponse(paidResult);
    }

    // 3. Vérifier l'abonnement d'essai (PRIORITÉ LA PLUS BASSE)
    console.log("Checking trial access for", user.email);
    const trialResult = await checkTrialAccess(supabaseClient, user);
    if (trialResult) {
      console.log("Trial access result for", user.email, ":", trialResult);
      return createResponse(trialResult);
    }

    // Aucun abonnement trouvé
    console.log('Aucun abonnement actif trouvé pour', user.email);
    return createResponse({ 
      access: false, 
      message: 'Aucun abonnement actif' 
    });

  } catch (error) {
    console.error('Erreur générale:', error);
    return createResponse({ 
      error: error.message,
      stack: error.stack,
      access: false,
      message: 'Erreur serveur lors de la vérification de l\'accès'
    }, 500);
  }
});
