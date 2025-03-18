
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

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
    const userId = record.id

    console.log(`Inscription d'un nouvel utilisateur: ${firstName} (${email}), userId: ${userId}`)

    // Déterminer le type d'utilisateur et la liste Brevo
    let userType = 'free'; // Par défaut, les nouveaux utilisateurs sont des utilisateurs gratuits
    
    // Vérifier si l'utilisateur a une souscription existante
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');
      
    if (subError) {
      console.error('Erreur lors de la vérification des souscriptions:', subError);
    }
    
    if (subscriptions && subscriptions.length > 0) {
      // Déterminer le type d'utilisateur en fonction de la souscription
      const priorityOrder = ['paid', 'trial', 'beta', 'ambassador'];
      
      // Trier les souscriptions par priorité
      subscriptions.sort((a, b) => {
        return priorityOrder.indexOf(a.type) - priorityOrder.indexOf(b.type);
      });
      
      const highestPrioritySubscription = subscriptions[0];
      
      if (highestPrioritySubscription.type === 'paid' || highestPrioritySubscription.type === 'trial') {
        userType = 'premium';
      } else if (highestPrioritySubscription.type === 'beta') {
        userType = 'beta';
      } else if (highestPrioritySubscription.type === 'ambassador') {
        userType = 'ambassador';
      }
    }
    
    console.log(`Type d'utilisateur déterminé: ${userType}`);

    // Ajouter l'utilisateur à Brevo
    try {
      const { data: brevoResponse, error: brevoError } = await supabase.functions.invoke(
        'create-brevo-contact',
        {
          body: {
            email: email,
            contactName: firstName,
            userType: userType,
            source: "signup",
            userId: userId
          }
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
        message: "Utilisateur inscrit avec succès et ajouté à Brevo",
        userType: userType
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
