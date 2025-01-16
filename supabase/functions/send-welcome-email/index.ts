import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  userId: string
  email: string
  firstName: string
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 Starting send-welcome-email function')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, email, firstName } = await req.json() as EmailPayload
    console.log('📧 Sending welcome email to:', { userId, email, firstName })

    // Vérifier si l'email n'a pas déjà été envoyé
    const { data: existingEmail, error: queryError } = await supabase
      .from('welcome_emails')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (queryError) {
      console.error('❌ Error checking existing email:', queryError)
      throw queryError
    }

    if (existingEmail?.sent_at) {
      console.log('✋ Welcome email already sent for user:', userId)
      return new Response(
        JSON.stringify({ message: 'Welcome email already sent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Envoyer l'email via Brevo
    console.log('📤 Sending email via Brevo API...')
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: {
          name: 'PedagoIA',
          email: 'contact@pedagoia.fr'
        },
        to: [{
          email: email,
          name: firstName || 'Utilisateur'
        }],
        subject: 'Bienvenue sur PedagoIA !',
        htmlContent: `
          <h1>Bienvenue ${firstName} !</h1>
          <p>Nous sommes ravis de vous accueillir sur PedagoIA.</p>
          <p>Notre assistant pédagogique intelligent est là pour vous aider à créer des contenus pédagogiques innovants et personnalisés.</p>
          <p>N'hésitez pas à explorer toutes nos fonctionnalités :</p>
          <ul>
            <li>Création de séquences pédagogiques</li>
            <li>Génération d'exercices différenciés</li>
            <li>Rédaction de correspondances</li>
          </ul>
          <p>Si vous avez des questions, notre équipe est là pour vous accompagner.</p>
          <p>Bonne découverte !</p>
          <p>L'équipe PedagoIA</p>
        `
      })
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ Brevo API error:', {
        status: res.status,
        statusText: res.statusText,
        error: errorText
      })
      throw new Error(`Brevo API error: ${errorText}`)
    }

    const result = await res.json()
    console.log('✅ Email sent successfully:', result)

    // Mettre à jour le statut dans la base de données
    const { error: updateError } = await supabase
      .from('welcome_emails')
      .update({
        sent_at: new Date().toISOString(),
        status: 'sent'
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('❌ Error updating email status:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Welcome email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error in send-welcome-email:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        name: error.name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

serve(handler)