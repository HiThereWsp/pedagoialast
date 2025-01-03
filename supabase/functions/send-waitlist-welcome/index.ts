import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface WaitlistData {
  email: string
  firstName: string
  teachingLevel: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Starting send-waitlist-welcome function...")
    
    const waitlistData: WaitlistData = await req.json()
    console.log("Received data:", waitlistData)

    if (!BREVO_API_KEY) {
      console.error("❌ BREVO_API_KEY is not set")
      throw new Error("BREVO_API_KEY is not configured")
    }
    console.log("✓ BREVO_API_KEY is configured")

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "PedagoIA",
          email: "bonjour@pedagoia.fr"
        },
        to: [{
          email: waitlistData.email,
          name: waitlistData.firstName
        }],
        subject: "Bienvenue sur la liste d'attente PedagoIA ! 🎉",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Bienvenue ${waitlistData.firstName} ! 👋</h1>
            
            <p>Nous sommes ravis de vous compter parmi les premiers enseignants intéressés par PedagoIA.</p>
            
            <p>Voici un récapitulatif de vos informations :</p>
            <ul>
              <li>Nom : ${waitlistData.firstName}</li>
              <li>Email : ${waitlistData.email}</li>
              <li>Niveau d'enseignement : ${waitlistData.teachingLevel}</li>
            </ul>
            
            <p>Nous travaillons actuellement sur :</p>
            <ul>
              <li>🎯 L'amélioration de notre IA pour mieux répondre à vos besoins</li>
              <li>📚 La création de ressources pédagogiques adaptées</li>
              <li>🔄 L'optimisation de notre interface utilisateur</li>
            </ul>
            
            <p>Nous vous tiendrons informé(e) des avancées et vous contacterons dès que nous serons prêts à vous accueillir sur la plateforme.</p>
            
            <p style="margin-top: 30px;">À très bientôt !</p>
            <p>L'équipe PedagoIA</p>
            
            <div style="margin-top: 40px; font-size: 12px; color: #666;">
              <p>Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:bonjour@pedagoia.fr">bonjour@pedagoia.fr</a></p>
            </div>
          </div>
        `
      }),
    })

    const responseData = await response.text()
    console.log("Brevo API response status:", response.status)
    console.log("Brevo API response body:", responseData)

    if (!response.ok) {
      console.error("❌ Error from Brevo API:", responseData)
      throw new Error(`Failed to send email via Brevo: ${responseData}`)
    }

    console.log("✓ Email sent successfully via Brevo")
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )

  } catch (error) {
    console.error("❌ Error in send-waitlist-welcome function:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})