import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendBrevoEmail(to: string, templateId: number, params: any) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY!,
    },
    body: JSON.stringify({
      to: [{ email: to }],
      templateId: templateId,
      params: params,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to send email: ${await response.text()}`)
  }

  return response.json()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    })

    // Récupérer tous les abonnements actifs
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      expand: ['data.customer'],
    })

    for (const subscription of subscriptions.data) {
      const customer = subscription.customer as Stripe.Customer
      const trialEnd = subscription.trial_end
      const email = customer.email

      if (!email) continue

      const now = Math.floor(Date.now() / 1000)

      // Email pour fin de période d'essai proche (2 jours avant)
      if (trialEnd && (trialEnd - now) <= 172800) { // 48 heures en secondes
        await sendBrevoEmail(email, 1, { // Remplacer 1 par l'ID de votre template Brevo
          trial_end_date: new Date(trialEnd * 1000).toLocaleDateString(),
          subscription_plan: subscription.items.data[0].price.nickname,
        })
        console.log(`Sent trial ending soon email to ${email}`)
      }

      // Email pour paiement à venir (3 jours avant)
      const nextPayment = subscription.current_period_end
      if ((nextPayment - now) <= 259200) { // 72 heures en secondes
        await sendBrevoEmail(email, 2, { // Remplacer 2 par l'ID de votre template Brevo
          payment_date: new Date(nextPayment * 1000).toLocaleDateString(),
          amount: subscription.items.data[0].price.unit_amount! / 100,
        })
        console.log(`Sent upcoming payment email to ${email}`)
      }
    }

    // Vérifier les abonnements expirés récemment
    const expiredSubscriptions = await stripe.subscriptions.list({
      status: 'canceled',
      created: {
        // Vérifier les annulations des dernières 24 heures
        gte: Math.floor(Date.now() / 1000) - 86400,
      },
    })

    for (const subscription of expiredSubscriptions.data) {
      const customer = await stripe.customers.retrieve(subscription.customer as string)
      if (customer.deleted) continue

      const email = customer.email
      if (!email) continue

      await sendBrevoEmail(email, 3, { // Remplacer 3 par l'ID de votre template Brevo
        cancellation_date: new Date(subscription.canceled_at! * 1000).toLocaleDateString(),
      })
      console.log(`Sent subscription canceled email to ${email}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing customer emails:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})