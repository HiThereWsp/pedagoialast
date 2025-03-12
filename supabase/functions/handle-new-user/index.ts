
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
  SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 handle-new-user function started')
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request received')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()
    
    // Extraire firstName de manière sécurisée
    const firstName = record.raw_user_meta_data?.first_name || null;
    
    console.log('📝 Nouvel utilisateur créé:', {
      id: record.id,
      email: record.email,
      firstName: firstName
    })

    // Appeler la fonction create-brevo-contact
    console.log('📧 Tentative d\'ajout du contact à Brevo...')
    const { data: brevoResponse, error: brevoError } = await supabase.functions.invoke(
      'create-brevo-contact',
      {
        body: JSON.stringify({
          userId: record.id,
          email: record.email,
          firstName: firstName
        })
      }
    )

    if (brevoError) {
      console.error('❌ Échec de l\'ajout à Brevo:', brevoError)
      // Ne pas échouer complètement même si Brevo échoue
    } else {
      console.log('✅ Contact ajouté à Brevo avec succès:', brevoResponse)
    }

    // Appeler la fonction process-welcome-emails
    console.log('📧 Tentative de traitement de l\'email de bienvenue...')
    const { data: welcomeEmailResponse, error: welcomeEmailError } = await supabase.functions.invoke(
      'process-welcome-emails',
      {
        body: JSON.stringify({
          userId: record.id,
          email: record.email,
          firstName: firstName || 'Utilisateur'
        })
      }
    )

    if (welcomeEmailError) {
      console.error('❌ Échec du traitement de l\'email de bienvenue:', welcomeEmailError)
      // Ne pas échouer complètement même si l'email échoue
    } else {
      console.log('✅ Email de bienvenue traité avec succès:', welcomeEmailResponse)
    }

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
