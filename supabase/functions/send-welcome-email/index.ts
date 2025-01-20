import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 Starting send-welcome-email function')
  
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
      try {
        // Utiliser l'API email de Supabase
        const emailResponse = await supabase.auth.admin.sendRawEmail({
          email: email.email,
          subject: 'Bienvenue sur PedagoIA !',
          html: `
            <h1>Bonjour ${email.first_name || 'Utilisateur'} !</h1>
            <p>Bienvenue sur PedagoIA, votre assistant pédagogique intelligent.</p>
            <p>Nous sommes ravis de vous compter parmi nous et nous espérons que notre outil vous aidera à créer des contenus pédagogiques innovants et personnalisés.</p>
            <p>N'hésitez pas à explorer toutes les fonctionnalités disponibles et à nous faire part de vos retours !</p>
            <p>À très bientôt sur PedagoIA !</p>
          `
        })

        if (emailResponse.error) {
          throw emailResponse.error
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
    console.error('❌ Error in send-welcome-email:', error)
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