import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0"

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendBrevoEmail(templateId: number, to: string, params: Record<string, any>) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY!,
    },
    body: JSON.stringify({
      to: [{ email: to }],
      templateId,
      params,
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

    const signature = req.headers.get('stripe-signature')!
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )

    console.log(`Processing Stripe event: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customer = await stripe.customers.retrieve(session.customer as string)
        
        if (!customer.deleted && customer.email) {
          // Email de bienvenue
          await sendBrevoEmail(1, customer.email, {
            first_name: customer.name,
            guarantee_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          })
          
          // Planifier le rappel pour J+5
          setTimeout(async () => {
            await sendBrevoEmail(2, customer.email, {
              first_name: customer.name,
              days_left: 2,
            })
          }, 5 * 24 * 60 * 60 * 1000)
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const customer = await stripe.customers.retrieve(charge.customer as string)
        
        if (!customer.deleted && customer.email) {
          // Email de confirmation de remboursement
          await sendBrevoEmail(3, customer.email, {
            first_name: customer.name,
            refund_amount: charge.amount_refunded / 100,
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        
        if (!customer.deleted && customer.email) {
          const subscriptionAge = Date.now() - subscription.start_date * 1000
          
          if (subscriptionAge > 7 * 24 * 60 * 60 * 1000) {
            // Email de confirmation de fin de période de garantie
            await sendBrevoEmail(4, customer.email, {
              first_name: customer.name,
            })
          }
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error handling Stripe event:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})