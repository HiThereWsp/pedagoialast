
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
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }

  try {
    // Récupérer le token d'authentification
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
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
    
    // Initialiser le client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Vérifier l'utilisateur
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
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

    // Vérifier si c'est un utilisateur beta
    const { data: betaUser, error: betaError } = await supabaseClient
      .from('beta_users')
      .select('*')
      .eq('email', user.email)
      .single();
      
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

    // Vérifier l'abonnement dans la table user_subscriptions
    const { data: subscription, error: subError } = await supabaseClient
      .from('user_subscriptions')
      .select('status, type, expires_at, promo_code')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (subscription) {
      console.log('Abonnement trouvé:', subscription);
      
      // Vérifier si l'abonnement est expiré
      if (subscription.expires_at) {
        const expiryDate = new Date(subscription.expires_at);
        if (expiryDate < new Date()) {
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
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
