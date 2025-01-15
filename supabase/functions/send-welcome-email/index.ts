import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  userId: string;
  email: string;
  firstName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 Démarrage de la fonction send-welcome-email')
  console.log('📝 Méthode de la requête:', req.method)
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request received')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!BREVO_API_KEY) {
      console.error('❌ BREVO_API_KEY manquante dans les variables d\'environnement')
      throw new Error('BREVO_API_KEY n\'est pas configurée')
    }

    console.log('📧 Lecture du corps de la requête...')
    const payload: EmailPayload = await req.json()
    console.log('📝 Payload reçu:', payload)

    console.log('📧 Préparation de l\'email avec Brevo')
    const emailData = {
      sender: {
        name: 'PedagoIA',
        email: 'contact@pedagoia.fr'
      },
      to: [{
        email: payload.email,
        name: payload.firstName
      }],
      subject: 'Bienvenue sur PedagoIA !',
      htmlContent: `
        <h1>Bienvenue ${payload.firstName} !</h1>
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
    }
    console.log('📝 Données de l\'email préparées:', emailData)

    console.log('📤 Envoi de la requête à l\'API Brevo...')
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(emailData)
    })

    console.log('📥 Réponse reçue de Brevo:', {
      status: response.status,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erreur détaillée de Brevo:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers.entries())
      })
      throw new Error(`Erreur lors de l'envoi de l'email: ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Email envoyé avec succès:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('❌ Erreur détaillée dans send-welcome-email:', {
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