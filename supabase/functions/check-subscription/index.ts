
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  )

  try {
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user
    
    if (!user?.id) {
      throw new Error('User not found')
    }

    console.log("Checking subscription status for user:", user.id);

    // Utiliser une requête SQL directe pour éviter les problèmes de RLS
    const { data: subscriptionData, error: subscriptionError } = await supabaseClient
      .rpc('get_user_subscription_status', { user_uuid: user.id });

    if (subscriptionError) {
      console.error("Error retrieving subscription:", subscriptionError);
      
      // Si l'erreur n'est pas "aucune donnée trouvée", c'est une erreur technique
      return new Response(
        JSON.stringify({ 
          subscribed: false,
          subscription: null,
          message: "Error fetching subscription data" 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    if (!subscriptionData || subscriptionData.length === 0) {
      return new Response(
        JSON.stringify({ 
          subscribed: false,
          message: "No subscription found"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    // Utiliser la première entrée si c'est un tableau
    const subscription = Array.isArray(subscriptionData) ? subscriptionData[0] : subscriptionData;
    
    // Vérifier si l'abonnement est actif
    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    const isActive = subscription.status === 'active' && expiresAt > now;
    
    console.log("Subscription check result:", {
      type: subscription.type,
      status: subscription.status,
      expiresAt: subscription.expires_at,
      isActive
    });

    // Si c'est un abonnement Stripe et qu'il est actif, on vérifie aussi dans Stripe
    if (isActive && subscription.type === 'paid' && subscription.stripe_subscription_id) {
      try {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
          apiVersion: '2023-10-16',
        });
        
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );
        
        console.log("Stripe subscription status:", stripeSubscription.status);
        
        // Si l'abonnement Stripe n'est pas actif, on met à jour notre base
        if (stripeSubscription.status !== 'active' && stripeSubscription.status !== 'trialing') {
          await supabaseClient
            .from('user_subscriptions')
            .update({
              status: 'expired',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
            
          return new Response(
            JSON.stringify({ 
              subscribed: false,
              subscription: {
                type: subscription.type,
                status: 'expired',
                expiresAt: subscription.expires_at,
                stripeStatus: stripeSubscription.status
              }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
      } catch (stripeError) {
        console.error("Error checking Stripe subscription:", stripeError);
        // On continue quand même, on se fie à notre base de données
      }
    }

    return new Response(
      JSON.stringify({ 
        subscribed: isActive,
        subscription: {
          type: subscription.type,
          status: subscription.status,
          expiresAt: subscription.expires_at
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error checking subscription:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
