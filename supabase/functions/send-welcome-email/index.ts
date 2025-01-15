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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload: EmailPayload = await req.json()
    console.log('Début de l\'envoi d\'email de bienvenue pour:', payload)

    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY n\'est pas configurée')
    }

    console.log('Préparation de la requête vers Brevo API')
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
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
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erreur Brevo:', errorText)
      throw new Error(`Erreur lors de l'envoi de l'email: ${errorText}`)
    }

    const result = await response.json()
    console.log('Email envoyé avec succès:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Erreur détaillée dans send-welcome-email:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}

serve(handler)