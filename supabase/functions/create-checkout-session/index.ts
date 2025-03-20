
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const { priceId, subscriptionType, productId, testMode } = await req.json();
    console.log('Request data:', { priceId, subscriptionType, productId, testMode });
    
    if (!priceId) {
      throw new Error('Prix non spécifié');
    }
    
    // Utiliser la clé Stripe appropriée en fonction du mode (test ou production)
    // La clé de test commence par sk_test_, la clé de production par sk_live_
    const stripeSecretKey = testMode 
      ? Deno.env.get('STRIPE_SECRET_KEY_TEST') || Deno.env.get('STRIPE_SECRET_KEY')
      : Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY manquante');
      throw new Error('Configuration Stripe manquante');
    }
    
    console.log(`Utilisation de la clé Stripe en mode: ${testMode ? 'TEST' : 'PRODUCTION'}`);
    console.log(`La clé commence par: ${stripeSecretKey.substring(0, 7)}...`);
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2020-08-27',
    });

    // Récupérer l'information de l'utilisateur depuis le token JWT
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    let userEmail = null;
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { supabaseClient } = await import('https://esm.sh/@supabase/supabase-js@2.45.0');
        
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        
        const supabase = supabaseClient(supabaseUrl, supabaseAnonKey);
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          userId = user.id;
          userEmail = user.email;
          console.log(`Utilisateur authentifié: ${userEmail}`);
        }
      } catch (error) {
        console.error('Erreur d\'authentification:', error);
        // Continue sans information utilisateur
      }
    }

    // Créer la session checkout en mode test ou production selon la configuration
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/pricing?canceled=true`,
      // Inclure des métadonnées pour le webhook
      metadata: {
        subscription_type: subscriptionType,
        product_id: productId,
        user_id: userId,
        test_mode: testMode ? 'true' : 'false'
      },
      // Si l'utilisateur est connecté, pré-remplir son email
      ...(userEmail ? { customer_email: userEmail } : {})
    });

    if (!session.url) {
      throw new Error('Impossible de créer l\'URL de session Stripe');
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
