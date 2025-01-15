import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 handle-new-user function started')
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request received')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()
    console.log('📝 Nouvel utilisateur créé:', {
      id: record.id,
      email: record.email,
      firstName: record.raw_user_meta_data?.first_name
    })

    // Envoyer l'email de bienvenue
    console.log('📧 Tentative d\'envoi de l\'email de bienvenue...')
    const welcomeEmailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-welcome-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        userId: record.id,
        email: record.email,
        firstName: record.raw_user_meta_data?.first_name || 'Utilisateur'
      })
    })

    if (!welcomeEmailResponse.ok) {
      const errorText = await welcomeEmailResponse.text()
      console.error('❌ Échec de l\'envoi de l\'email de bienvenue:', {
        status: welcomeEmailResponse.status,
        statusText: welcomeEmailResponse.statusText,
        error: errorText,
        headers: Object.fromEntries(welcomeEmailResponse.headers.entries())
      })
      throw new Error(`Erreur lors de l'envoi de l'email: ${errorText}`)
    }

    const responseData = await welcomeEmailResponse.json()
    console.log('✅ Email de bienvenue envoyé avec succès:', responseData)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('❌ Erreur détaillée dans handle-new-user:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      name: error.name
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}

serve(handler)