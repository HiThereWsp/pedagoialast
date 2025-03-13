import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

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
    const { priceId } = await req.json()
    console.log('Received request with priceId:', priceId)
    
    if (!priceId) {
      throw new Error('Price ID is required')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    console.log('Auth header present:', !!authHeader)
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError) {
      console.error('Error getting user:', userError)
      throw new Error('Authentication failed')
    }

    if (!user?.email) {
      console.error('No user email found')
      throw new Error('User email not found')
    }
    
    if (!user?.id) {
      console.error('No user ID found')
      throw new Error('User ID not found')
    }

    console.log('Found user email:', user.email)

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    console.log('Creating checkout session for:', {
      priceId,
      userEmail: user.email,
      userId: user.id,
    })

    // Vérifier si l'utilisateur a déjà un customer_id dans Stripe
    const { data: subscriptionData, error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();
      
    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error checking existing subscription:', subscriptionError);
      throw new Error('Failed to check subscription status');
    }
    
    let customerId = subscriptionData?.stripe_customer_id;

    // Si pas de customer_id enregistré, vérifier s'il existe déjà un client avec cet email
    if (!customerId) {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      
      customerId = customers.data[0]?.id;
      console.log('Existing customer ID:', customerId);
    }

    // Créer un nouveau client si nécessaire
    if (!customerId) {
      console.log('Creating new customer');
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });
      customerId = customer.id;
      console.log('New customer created:', customerId);
      
      // Mettre à jour la table user_subscriptions avec le nouveau customer_id
      const { error: updateError } = await supabaseClient
        .from('user_subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
        
      if (updateError) {
        console.error('Error updating customer ID:', updateError);
        // On continue quand même, ce n'est pas bloquant
      }
    }

    // Créer la session de paiement
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/subscription-success`,
      cancel_url: `${req.headers.get('origin')}/checkout-canceled`,
      client_reference_id: user.id, // Pour identifier l'utilisateur dans les webhooks
    });

    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in create-checkout-session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
