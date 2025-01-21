import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
)

const getWelcomeEmailTemplate = (firstName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bienvenue sur PedagoIA</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.5;
      color: #374151;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4F46E5;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 0.875rem;
      color: #6B7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bienvenue sur PedagoIA !</h1>
    </div>
    <div class="content">
      <p>Bonjour ${firstName} !</p>
      <p>Nous sommes ravis de vous compter parmi nous et nous espérons que notre outil vous aidera à créer des contenus pédagogiques innovants et personnalisés.</p>
      <p>N'hésitez pas à explorer toutes les fonctionnalités disponibles et à nous faire part de vos retours !</p>
      <a href="https://app.pedagoia.fr" class="button">Accéder à PedagoIA</a>
    </div>
    <div class="footer">
      <p>© 2024 PedagoIA. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
`

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 Starting process-welcome-emails function')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Récupérer les emails en attente
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('welcome_emails')
      .select('*')
      .eq('status', 'pending')
      .is('error', null)

    if (fetchError) {
      console.error('❌ Error fetching pending emails:', fetchError)
      throw fetchError
    }

    console.log(`📧 Found ${pendingEmails?.length || 0} pending welcome emails`)

    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending emails to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    for (const email of pendingEmails) {
      console.log(`Processing email for: ${email.email}`)
      
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'PedagoIA <contact@pedagoia.fr>',
            to: email.email,
            subject: 'Bienvenue sur PedagoIA !',
            html: getWelcomeEmailTemplate(email.first_name || 'Utilisateur')
          })
        })

        if (!res.ok) {
          const errorText = await res.text()
          console.error('❌ Resend API error:', {
            status: res.status,
            statusText: res.statusText,
            error: errorText
          })
          throw new Error(`Resend API error: ${errorText}`)
        }

        // Mettre à jour le statut dans la base de données
        const { error: updateError } = await supabase
          .from('welcome_emails')
          .update({
            sent_at: new Date().toISOString(),
            status: 'sent'
          })
          .eq('id', email.id)

        if (updateError) {
          console.error('❌ Error updating email status:', updateError)
          throw updateError
        }

        console.log(`✅ Email sent successfully to ${email.email}`)
      } catch (error) {
        console.error(`❌ Error processing email ${email.id}:`, error)
        
        // Mettre à jour le statut d'erreur
        await supabase
          .from('welcome_emails')
          .update({
            error: error.message,
            status: 'error'
          })
          .eq('id', email.id)
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: pendingEmails.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error in process-welcome-emails:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

serve(handler)