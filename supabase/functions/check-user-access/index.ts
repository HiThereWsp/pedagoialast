
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { checkBetaAccess } from "./beta-access.ts";
import { checkPaidAccess } from "./paid-subscription.ts";
import { checkTrialAccess } from "./trial-subscription.ts";
import { authenticateUser, createResponse } from "./auth.ts";

// Headers CORS explicites et complets
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

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

// Fonction pour vérifier le statut d'ambassadeur
async function checkAmbassadorAccess(supabaseClient, user) {
  console.log("Checking ambassador status for user:", user.email);
  
  try {
    // Vérifier dans la table ambassador_program
    const { data: ambassador, error: ambassadorError } = await supabaseClient
      .from('ambassador_program')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
      
    if (ambassadorError) {
      console.error("Ambassador check error:", ambassadorError);
    }
    
    if (ambassador) {
      console.log('Ambassador found for', user.email, ':', ambassador);
      
      // Vérifier si l'accès ambassadeur est expiré
      if (ambassador.expires_at) {
        const expiryDate = new Date(ambassador.expires_at);
        if (expiryDate < new Date()) {
          console.log("Ambassador access expired at:", expiryDate, "for", user.email);
          return { 
            access: false, 
            message: 'Accès ambassadeur expiré',
            type: 'ambassador',
            expires_at: ambassador.expires_at
          };
        }
      }
      
      console.log("Active ambassador status found, granting access to", user.email);
      return { 
        access: true, 
        type: 'ambassador',
        expires_at: ambassador.expires_at
      };
    }
    
    // Vérifier également dans user_subscriptions pour type=ambassador
    const { data: ambassadorSub, error: ambassadorSubError } = await supabaseClient
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'ambassador')
      .eq('status', 'active')
      .maybeSingle();
      
    if (ambassadorSubError) {
      console.error("Ambassador subscription check error:", ambassadorSubError);
    }
    
    if (ambassadorSub) {
      console.log('Ambassador subscription found for', user.email, ':', ambassadorSub);
      
      // Vérifier si l'abonnement ambassadeur est expiré
      if (ambassadorSub.expires_at) {
        const expiryDate = new Date(ambassadorSub.expires_at);
        if (expiryDate < new Date()) {
          console.log("Ambassador subscription expired at:", expiryDate, "for", user.email);
          return { 
            access: false, 
            message: 'Abonnement ambassadeur expiré',
            type: 'ambassador',
            expires_at: ambassadorSub.expires_at
          };
        }
      }
      
      console.log("Active ambassador subscription found, granting access to", user.email);
      return { 
        access: true, 
        type: 'ambassador',
        expires_at: ambassadorSub.expires_at
      };
    }
    
    return null;
  } catch (err) {
    console.error("Error in checkAmbassadorAccess:", err);
    return null;
  }
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

    // Vérifier l'accès dans l'ordre de priorité: 
    // Ambassador -> Beta -> Paid -> Trial
    
    // 1. Vérifier d'abord l'accès ambassadeur (PRIORITÉ LA PLUS HAUTE)
    console.log("Checking ambassador access for", user.email);
    const ambassadorResult = await checkAmbassadorAccess(supabaseClient, user);
    if (ambassadorResult) {
      console.log("Ambassador access result for", user.email, ":", ambassadorResult);
      return createResponse(ambassadorResult);
    }

    // 2. Vérifier l'accès beta (DEUXIÈME PRIORITÉ)
    console.log("Checking beta access for", user.email);
    const betaResult = await checkBetaAccess(supabaseClient, user);
    if (betaResult) {
      console.log("Beta access result for", user.email, ":", betaResult);
      return createResponse(betaResult);
    }

    // 3. Vérifier l'abonnement payant (TROISIÈME PRIORITÉ)
    console.log("Checking paid access for", user.email);
    const paidResult = await checkPaidAccess(supabaseClient, user);
    if (paidResult) {
      console.log("Paid access result for", user.email, ":", paidResult);
      return createResponse(paidResult);
    }

    // 4. Vérifier l'abonnement d'essai (PRIORITÉ LA PLUS BASSE)
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
