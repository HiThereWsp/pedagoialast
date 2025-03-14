
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

    // Vérifier si c'est un utilisateur beta
    console.log("Checking if user is beta user");
    try {
      const { data: betaUser, error: betaError } = await supabaseClient
        .from('beta_users')
        .select('*')
        .eq('email', user.email)
        .single();
        
      if (betaError && betaError.code !== 'PGRST116') {
        console.error("Beta user check error:", betaError);
      }
        
      if (betaUser) {
        console.log('Utilisateur beta trouvé');
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
    } catch (betaCheckError) {
      console.error("Error checking beta user:", betaCheckError);
      // Continue avec la vérification des abonnements même si la vérification beta échoue
    }

    // Vérifier l'abonnement dans la table user_subscriptions
    console.log("Checking subscription for user");
    try {
      const { data: subscription, error: subError } = await supabaseClient
        .from('user_subscriptions')
        .select('status, type, expires_at, promo_code')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (subError) {
        console.error("Subscription check error:", subError);
        return new Response(
          JSON.stringify({ 
            access: false, 
            message: 'Erreur lors de la vérification de l\'abonnement',
            error: subError.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
      
      if (subscription) {
        console.log('Abonnement trouvé:', subscription);
        
        // Vérifier si l'abonnement est expiré
        if (subscription.expires_at) {
          const expiryDate = new Date(subscription.expires_at);
          if (expiryDate < new Date()) {
            console.log("Subscription expired at:", expiryDate);
            return new Response(
              JSON.stringify({ 
                access: false, 
                message: 'Abonnement expiré',
                type: subscription.type,
                expires_at: subscription.expires_at
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
              }
            );
          }
        }
        
        console.log("Active subscription found, granting access");
        return new Response(
          JSON.stringify({ 
            access: true, 
            type: subscription.type,
            expires_at: subscription.expires_at,
            promo_code: subscription.promo_code
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    } catch (subscriptionCheckError) {
      console.error("Error checking subscription:", subscriptionCheckError);
      return new Response(
        JSON.stringify({ 
          access: false, 
          message: 'Erreur lors de la vérification de l\'abonnement',
          error: subscriptionCheckError.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Aucun abonnement trouvé
    console.log('Aucun abonnement trouvé pour', user.email);
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
