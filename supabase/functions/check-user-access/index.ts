
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }

  try {
    console.log("Starting check-user-access function");
    
    // Récupérer le token d'authentification
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.log("No Authorization header found");
      return new Response(
        JSON.stringify({ 
          access: false, 
          message: 'Non authentifié' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log("Token extracted from Authorization header");
    
    // Initialiser le client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );
    console.log("Supabase client initialized");

    // Vérifier l'utilisateur
    console.log("Checking user with token");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      console.error("User error:", userError);
      return new Response(
        JSON.stringify({ 
          access: false, 
          message: 'Utilisateur non trouvé',
          error: userError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }
    
    if (!user) {
      console.log("No user found");
      return new Response(
        JSON.stringify({ 
          access: false, 
          message: 'Utilisateur non trouvé' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }
    
    console.log("User found:", user.email);

    // En mode développement, retourner accès actif pour faciliter les tests
    if (Deno.env.get('ENVIRONMENT') === 'development') {
      console.log("Development environment detected, granting access");
      return new Response(
        JSON.stringify({ 
          access: true, 
          type: 'dev_mode',
          expires_at: null,
          message: 'Accès accordé en mode développement'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Vérifier si c'est un utilisateur beta - PRIORITAIRE
    console.log("Checking if user is beta user");
    try {
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
        console.log('Utilisateur beta trouvé dans la table beta_users');
        return new Response(
          JSON.stringify({ 
            access: true, 
            type: 'beta',
            expires_at: null,
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      // Deuxième méthode: Vérifier dans la table user_subscriptions avec type=beta
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
      }

      if (betaSubscription) {
        console.log('Abonnement beta trouvé dans user_subscriptions:', betaSubscription);
        
        // Vérifier si l'abonnement beta est expiré
        if (betaSubscription.expires_at) {
          const expiryDate = new Date(betaSubscription.expires_at);
          if (expiryDate < new Date()) {
            console.log("Beta subscription expired at:", expiryDate);
            return new Response(
              JSON.stringify({ 
                access: false, 
                message: 'Accès beta expiré',
                type: 'beta',
                expires_at: betaSubscription.expires_at
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
              }
            );
          }
        }
        
        console.log("Active beta subscription found, granting access");
        return new Response(
          JSON.stringify({ 
            access: true, 
            type: 'beta',
            expires_at: betaSubscription.expires_at,
            promo_code: betaSubscription.promo_code
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    } catch (betaCheckError) {
      console.error("Error checking beta user:", betaCheckError);
      // Continue avec la vérification des abonnements même si la vérification beta échoue
    }

    // Vérifier les abonnements payants - SECOND PRIORITAIRE
    console.log("Checking paid subscription for user");
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
        console.log('Abonnement payant trouvé:', paidSubscription);
        
        // Vérifier si l'abonnement est expiré
        if (paidSubscription.expires_at) {
          const expiryDate = new Date(paidSubscription.expires_at);
          if (expiryDate < new Date()) {
            console.log("Paid subscription expired at:", expiryDate);
            return new Response(
              JSON.stringify({ 
                access: false, 
                message: 'Abonnement expiré',
                type: paidSubscription.type,
                expires_at: paidSubscription.expires_at
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
              }
            );
          }
        }
        
        console.log("Active paid subscription found, granting access");
        return new Response(
          JSON.stringify({ 
            access: true, 
            type: paidSubscription.type,
            expires_at: paidSubscription.expires_at,
            promo_code: paidSubscription.promo_code
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    } catch (paidSubscriptionError) {
      console.error("Error checking paid subscription:", paidSubscriptionError);
    }

    // Vérifier les abonnements d'essai - DERNIER PRIORITÉ
    console.log("Checking trial subscription for user");
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
        console.log('Abonnement d\'essai trouvé:', trialSubscription);
        
        // Vérifier si l'abonnement est expiré
        if (trialSubscription.expires_at) {
          const expiryDate = new Date(trialSubscription.expires_at);
          if (expiryDate < new Date()) {
            console.log("Trial subscription expired at:", expiryDate);
            return new Response(
              JSON.stringify({ 
                access: false, 
                message: 'Période d\'essai expirée',
                type: trialSubscription.type,
                expires_at: trialSubscription.expires_at
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
              }
            );
          }
        }
        
        console.log("Active trial subscription found, granting access");
        return new Response(
          JSON.stringify({ 
            access: true, 
            type: trialSubscription.type,
            expires_at: trialSubscription.expires_at,
            promo_code: trialSubscription.promo_code
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    } catch (trialSubscriptionError) {
      console.error("Error checking trial subscription:", trialSubscriptionError);
    }

    // Aucun abonnement trouvé
    console.log('Aucun abonnement actif trouvé pour', user.email);
    return new Response(
      JSON.stringify({ 
        access: false, 
        message: 'Aucun abonnement actif' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Erreur générale:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        access: false,
        message: 'Erreur serveur lors de la vérification de l\'accès'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
