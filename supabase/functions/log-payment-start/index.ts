
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
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
    const { planType, userId, email, promoCode } = await req.json()
    console.log('Logging payment start for:', { planType, userId, email, promoCode });
    
    if (!planType || !userId || !email) {
      console.error('Missing required data');
      throw new Error('Les données de paiement sont incomplètes')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Enregistrer l'événement de début de paiement
    const { error: insertError } = await supabaseClient
      .from('user_events')
      .insert({
        user_id: userId,
        email: email,
        event_type: 'payment_started',
        metadata: {
          plan_type: planType,
          payment_method: 'stripe_checkout',
          promo_code: promoCode || null
        }
      });
      
    if (insertError) {
      console.error('Erreur d\'enregistrement:', insertError);
      throw insertError;
    }

    // Tenter de synchroniser avec Brevo 
    try {
      await supabaseClient.functions.invoke('create-brevo-contact', {
        body: {
          email: email,
          userType: "free", // Toujours gratuit jusqu'à confirmation du paiement
          source: "checkout_started"
        }
      });
      console.log('User prepared for premium list transfer in Brevo');
    } catch (brevoError) {
      console.error('Error preparing user in Brevo:', brevoError);
      // Continue despite Brevo error
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in log-payment-start:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
