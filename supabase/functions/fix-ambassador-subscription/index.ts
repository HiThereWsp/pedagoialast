
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
    console.log(`Attempting to fix ambassador subscription for: ${email}`);
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "L'email est requis" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log(`Processing ambassador subscription fix for email: ${email}`);
    
    // Trouver l'utilisateur par email
    const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error fetching users list:", userError);
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
      // Special case for known ambassador without account
      const knownAmbassadors = [
        'maitreclementtiktok@gmail.com',
        'zoe.lejan@gmail.com', 
        'marine.poirel1@gmail.com',
        'mehdijrad@live.fr',
        'ag.tradeunion@gmail.com'
      ];
      
      if (knownAmbassadors.includes(email)) {
        console.log(`Known ambassador without account: ${email}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Accès spécial accordé au compte ambassadeur sans utilisateur: ${email}`,
            details: {
              note: "Ce compte ambassadeur n'a pas besoin de réparation car il a un accès spécial configuré dans le code."
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
      
      console.error(`User not found for email: ${email}`);
      return new Response(
        JSON.stringify({ error: "Utilisateur non trouvé" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      );
    }
    
    console.log(`Found user with ID: ${user.id} for email: ${email}`);
    
    // Définir la date d'expiration pour l'ambassadeur (2 ans dans le futur)
    const expiresAt = new Date(Date.now() + (2 * 365 * 24 * 60 * 60 * 1000)).toISOString();
    
    // 1. Mettre à jour l'abonnement dans user_subscriptions
    try {
      const { error: subscriptionError } = await supabaseClient
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          type: 'ambassador',
          status: 'active',
          expires_at: expiresAt,
          stripe_subscription_id: 'manual_fix_' + Date.now(),
          stripe_customer_id: 'manual_fix_' + Date.now()
        }, {
          onConflict: 'user_id'
        });
        
      if (subscriptionError) {
        console.error("Error updating subscription:", subscriptionError);
      } else {
        console.log(`Successfully updated subscription for user: ${user.id}`);
      }
    } catch (e) {
      console.error("Exception during subscription update:", e);
    }
      
    // 2. Ajouter/mettre à jour dans la table ambassador_program
    try {
      const { error: ambassadorError } = await supabaseClient
        .from('ambassador_program')
        .upsert({
          user_id: user.id,
          email: email,
          status: 'active',
          approved_at: new Date().toISOString(),
          expires_at: expiresAt,
          notes: 'Réparation manuelle via fix-ambassador-subscription'
        }, {
          onConflict: 'user_id'
        });
        
      if (ambassadorError) {
        console.error("Error adding to ambassador program:", ambassadorError);
      } else {
        console.log(`Successfully added to ambassador program: ${user.id}`);
      }
    } catch (e) {
      console.error("Exception during ambassador program update:", e);
    }
    
    // 3. Clear any cached subscription info - send an event to invalidate
    try {
      const { error: eventError } = await supabaseClient
        .from('user_events')
        .insert({
          user_id: user.id,
          event_type: 'subscription_updated',
          metadata: {
            source: 'fix-ambassador-subscription',
            type: 'ambassador',
            timestamp: new Date().toISOString(),
            cache_invalidation: true
          }
        });
        
      if (eventError) {
        console.error("Error recording update event:", eventError);
      } else {
        console.log(`Successfully recorded update event for: ${user.id}`);
      }
    } catch (e) {
      console.error("Exception during event recording:", e);
    }
    
    // 4. Ajouter l'ambassadeur à la liste Brevo
    try {
      console.log(`Adding ambassador to Brevo list (ID 10): ${email}`);
      
      // Récupérer le prénom depuis le profil ou user metadata
      let firstName = null;
      try {
        const { data: profileData } = await supabaseClient
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();
          
        firstName = profileData?.first_name || 
                   user.user_metadata?.first_name || 
                   user.user_metadata?.name?.split(' ')[0] || 
                   null;
      } catch (e) {
        console.log('Impossible de récupérer le prénom:', e);
      }
      
      await supabaseClient.functions.invoke('create-brevo-contact', {
        body: {
          email: email,
          contactName: firstName || email.split('@')[0] || 'Ambassadeur',
          userType: "ambassador",
          source: "manual_fix"
        }
      });
      console.log(`Ambassador contact added to Brevo: ${email}`);
    } catch (brevoError) {
      console.error("Error adding contact to Brevo:", brevoError);
    }
    
    // 5. Envoyer l'email de bienvenue pour l'ambassadeur
    try {
      // Récupérer le prénom depuis le profil ou user metadata
      let firstName = null;
      try {
        const { data: profileData } = await supabaseClient
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();
          
        firstName = profileData?.first_name || 
                   user.user_metadata?.first_name || 
                   user.user_metadata?.name?.split(' ')[0] || 
                   null;
      } catch (e) {
        console.log('Impossible de récupérer le prénom:', e);
      }
      
      await supabaseClient.functions.invoke('send-ambassador-welcome', {
        body: {
          email: email,
          firstName: firstName,
          userId: user.id,
          manualSend: true // Forcer l'envoi même si déjà envoyé avant
        }
      });
      console.log(`Email de bienvenue ambassadeur envoyé à: ${email}`);
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'email de bienvenue:", emailError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Abonnement ambassadeur réparé pour ${email}`,
        details: {
          user_id: user.id,
          expires_at: expiresAt
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error("General error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
