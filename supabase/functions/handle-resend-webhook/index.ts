import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

interface ResendWebhookPayload {
  type: 'email.sent' | 'email.delivered' | 'email.delivery_delayed' | 'email.bounced' | 'email.complained';
  data: {
    email_id: string;
    to: string;
    from: string;
    subject: string;
  };
}

serve(async (req) => {
  console.log('🎯 Received webhook request')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('👍 Handling CORS preflight request')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload: ResendWebhookPayload = await req.json()
    console.log('📨 Received webhook from Resend:', JSON.stringify(payload, null, 2))

    // Trouver l'email correspondant dans la table welcome_emails
    const { data: welcomeEmail, error: findError } = await supabase
      .from('welcome_emails')
      .select('*')
      .eq('email', payload.data.to)
      .single()

    if (findError) {
      console.error('❌ Error finding welcome email:', findError)
      throw findError
    }

    if (!welcomeEmail) {
      console.error('⚠️ No welcome email found for:', payload.data.to)
      return new Response(
        JSON.stringify({ error: 'No welcome email found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✉️ Found welcome email:', welcomeEmail)

    // Mettre à jour le statut en fonction du type d'événement
    let status = welcomeEmail.status
    let error = null

    switch (payload.type) {
      case 'email.delivered':
        status = 'delivered'
        console.log('📬 Email marked as delivered')
        break
      case 'email.bounced':
        status = 'bounced'
        error = 'Email bounced'
        console.log('↩️ Email marked as bounced')
        break
      case 'email.complained':
        status = 'complained'
        error = 'Recipient complained'
        console.log('😠 Email marked as complained')
        break
      case 'email.delivery_delayed':
        status = 'delayed'
        error = 'Delivery delayed'
        console.log('⏳ Email marked as delayed')
        break
      default:
        console.log('ℹ️ Unhandled event type:', payload.type)
    }

    // Mettre à jour la table welcome_emails
    const { error: updateError } = await supabase
      .from('welcome_emails')
      .update({
        status,
        error,
        updated_at: new Date().toISOString()
      })
      .eq('id', welcomeEmail.id)

    if (updateError) {
      console.error('❌ Error updating welcome email:', updateError)
      throw updateError
    }

    console.log('✅ Successfully processed webhook')

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('❌ Error in handle-resend-webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})