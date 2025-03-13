
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request data
    const { record } = await req.json()
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Préparer les données de l'utilisateur
    const email = record.email
    const firstName = record.raw_user_meta_data?.first_name || 'Utilisateur'

    console.log(`Inscription d'un nouvel utilisateur: ${firstName} (${email})`)

    // Au lieu d'appeler directement l'API Brevo, utiliser la fonction create-brevo-contact
    try {
      const { data: brevoResponse, error: brevoError } = await supabase.functions.invoke(
        'create-brevo-contact',
        {
          body: JSON.stringify({
            email: email,
            contactName: firstName,
            userType: "free", // Par défaut, les nouveaux utilisateurs sont des utilisateurs gratuits
            source: "signup"
          })
        }
      );

      if (brevoError) {
        console.error(`Erreur lors de l'ajout de l'utilisateur à Brevo: ${JSON.stringify(brevoError)}`);
        // Continuer même en cas d'erreur pour ne pas bloquer l'inscription
      } else {
        console.log(`Utilisateur ajouté à Brevo avec succès: ${JSON.stringify(brevoResponse)}`);
      }
    } catch (brevoCallError) {
      console.error(`Exception lors de l'appel à create-brevo-contact: ${brevoCallError.message}`);
      // Continuer même en cas d'erreur
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Utilisateur inscrit avec succès et ajouté à Brevo"
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error(`Erreur dans handle-user-signup: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
});
