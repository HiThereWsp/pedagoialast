
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Gérer les requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Initialiser le client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Extraire l'email de l'utilisateur de la requête
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "L'email est requis" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log(`Tentative de réparation de l'abonnement pour l'email: ${email}`);
    
    // Trouver l'utilisateur par email
    const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
    
    if (userError) {
      console.error("Erreur lors de la récupération des utilisateurs:", userError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la récupération des utilisateurs" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    const user = userData.users.find(u => u.email === email);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Utilisateur non trouvé" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      );
    }
    
    console.log(`Utilisateur trouvé: ${user.id}`);
    
    // 1. Mettre à jour l'abonnement dans user_subscriptions
    const { error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        type: 'ambassador',
        status: 'active',
        expires_at: new Date('2025-08-28').toISOString(),
        stripe_subscription_id: 'manual_fix_' + Date.now(),
        stripe_customer_id: 'manual_fix_' + Date.now()
      }, {
        onConflict: 'user_id'
      });
      
    if (subscriptionError) {
      console.error("Erreur lors de la mise à jour de l'abonnement:", subscriptionError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la mise à jour de l'abonnement" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    // 2. Ajouter/mettre à jour dans la table ambassador_program
    const { error: ambassadorError } = await supabaseClient
      .from('ambassador_program')
      .upsert({
        user_id: user.id,
        email: email,
        status: 'active',
        approved_at: new Date().toISOString(),
        expires_at: new Date('2025-08-28').toISOString(),
        notes: 'Réparation manuelle via fix-ambassador-subscription'
      }, {
        onConflict: 'user_id'
      });
      
    if (ambassadorError) {
      console.error("Erreur lors de l'ajout au programme ambassadeur:", ambassadorError);
      // Continuer même en cas d'erreur
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Abonnement ambassadeur réparé pour ${email}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error("Erreur générale:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
