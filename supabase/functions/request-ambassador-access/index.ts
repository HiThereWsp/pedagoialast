
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
    // Vérifier que c'est une requête POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Méthode non autorisée' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405,
        }
      );
    }

    // Récupérer les paramètres de la requête
    const { fullName } = await req.json();

    // Authentifier l'utilisateur
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Erreur d\'authentification:', userError);
      return new Response(
        JSON.stringify({ error: 'Non autorisé', details: userError?.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    console.log('Utilisateur authentifié:', user.email);

    // Vérifier si l'utilisateur existe déjà dans ambassador_program
    const { data: existingAmbassador, error: checkError } = await supabaseClient
      .from('ambassador_program')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingAmbassador) {
      console.log('Utilisateur déjà dans le programme ambassadeur:', existingAmbassador);
      
      // Mettre à jour les informations si nécessaire
      const { data: updatedAmbassador, error: updateError } = await supabaseClient
        .from('ambassador_program')
        .update({
          full_name: fullName || existingAmbassador.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select();
        
      if (updateError) {
        console.error('Erreur de mise à jour des informations:', updateError);
        return new Response(
          JSON.stringify({ error: 'Erreur de mise à jour des informations', details: updateError.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Vos informations ont été mises à jour', 
          data: updatedAmbassador[0]
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Ajouter l'utilisateur au programme ambassadeur
    const { data: newAmbassador, error: insertError } = await supabaseClient
      .from('ambassador_program')
      .insert({
        user_id: user.id,
        email: user.email,
        full_name: fullName,
        status: 'requested',
        requested_at: new Date().toISOString(),
        notes: 'Demande via formulaire web'
      })
      .select();

    if (insertError) {
      console.error('Erreur d\'ajout au programme ambassadeur:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erreur d\'ajout au programme ambassadeur', details: insertError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Notifier par email de la demande (exemple)
    try {
      // Ici, vous pourriez appeler une autre edge function pour envoyer un email
      await supabaseClient.functions.invoke('create-brevo-contact', {
        body: { 
          email: user.email,
          contactName: fullName || user.email.split('@')[0],
          userType: "ambassador_pending",
          source: "ambassador_request"
        }
      });
      console.log('Notification envoyée avec succès');
    } catch (emailError) {
      console.error('Erreur d\'envoi de notification:', emailError);
      // Continue malgré l'erreur d'email
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Votre demande d\'accès ambassadeur a été enregistrée', 
        data: newAmbassador[0] 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    );
  } catch (error) {
    console.error('Erreur générale:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur', details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
