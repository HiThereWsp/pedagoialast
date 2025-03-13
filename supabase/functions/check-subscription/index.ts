
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

    // Requête SQL directe, sans utiliser RPC qui peut causer des problèmes
    const { data: subscriptionData, error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subscriptionError) {
      console.error("Error retrieving subscription:", subscriptionError);
      
      // Vérifier si c'est un bêta testeur basé sur l'email
      const betaEmails = [
        '@pedagogia.io',
        '@example.com',
        'andyguitteaud@gmail.com'
      ];
      
      const isBetaTester = user.email && betaEmails.some(domain => 
        user.email?.includes(domain) || user.email === domain
      );
      
      if (isBetaTester) {
        return new Response(
          JSON.stringify({ 
            subscribed: true,
            subscription: {
              type: 'beta',
              status: 'active',
              expiresAt: new Date(2024, 11, 31).toISOString(), // 31 décembre 2024
              daysLeft: 365
            },
            message: "Beta tester account"
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
      
      // Si l'erreur n'est pas "aucune donnée trouvée", c'est une erreur technique
      return new Response(
        JSON.stringify({ 
          subscribed: false,
          subscription: null,
          message: "Error fetching subscription data",
          error: subscriptionError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    if (!subscriptionData) {
      // Vérifier si c'est un bêta testeur basé sur l'email
      const betaEmails = [
        '@pedagogia.io',
        '@example.com',
        'andyguitteaud@gmail.com'
      ];
      
      const isBetaTester = user.email && betaEmails.some(domain => 
        user.email?.includes(domain) || user.email === domain
      );
      
      if (isBetaTester) {
        return new Response(
          JSON.stringify({ 
            subscribed: true,
            subscription: {
              type: 'beta',
              status: 'active',
              expiresAt: new Date(2024, 11, 31).toISOString(), // 31 décembre 2024
              daysLeft: 365
            },
            message: "Beta tester account"
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
      
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
    
    // Vérifier si l'abonnement est actif
    const now = new Date();
    const expiresAt = new Date(subscriptionData.expires_at);
    const isActive = subscriptionData.status === 'active' && expiresAt > now;
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log("Subscription check result:", {
      type: subscriptionData.type,
      status: subscriptionData.status,
      expiresAt: subscriptionData.expires_at,
      isActive,
      daysLeft: daysLeft > 0 ? daysLeft : 0
    });

    // Si c'est un abonnement Stripe et qu'il est actif, on vérifie aussi dans Stripe
    if (isActive && subscriptionData.type === 'paid' && subscriptionData.stripe_subscription_id) {
      try {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
          apiVersion: '2023-10-16',
        });
        
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscriptionData.stripe_subscription_id
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
                type: subscriptionData.type,
                status: 'expired',
                expiresAt: subscriptionData.expires_at,
                stripeStatus: stripeSubscription.status,
                daysLeft: 0
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
          type: subscriptionData.type,
          status: subscriptionData.status,
          expiresAt: subscriptionData.expires_at,
          daysLeft: daysLeft > 0 ? daysLeft : 0
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
      JSON.stringify({ 
        error: error.message, 
        subscribed: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // On renvoie quand même 200 pour ne pas bloquer l'UI
      }
    )
  }
})
