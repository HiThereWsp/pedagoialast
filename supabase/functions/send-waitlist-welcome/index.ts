import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface WelcomeEmailRequest {
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
    
    const { email, firstName, teachingLevel }: WelcomeEmailRequest = await req.json()
    console.log("Request data:", { email, firstName, teachingLevel })

    if (!RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is not set")
      throw new Error("RESEND_API_KEY is not configured")
    }
    console.log("✓ RESEND_API_KEY is configured")

    const emailData = {
      from: "PedagoIA <bonjour@pedagoia.fr>",
      to: [email],
      subject: "Bienvenue sur la liste d'attente PedagoIA ! 🎉",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0F172A;">Bonjour ${firstName} !</h1>
          
          <p>Merci beaucoup pour votre inscription à la liste d'attente de PedagoIA. Nous sommes ravis de votre intérêt pour notre assistant pédagogique !</p>
          
          <p>Nous avons bien noté que vous enseignez en ${teachingLevel}. Votre expérience et votre perspective seront précieuses pour nous aider à développer un outil qui répond vraiment aux besoins des enseignants.</p>
          
          <p>Nous travaillons actuellement d'arrache-pied pour créer la meilleure expérience possible. Vous serez parmi les premiers informés dès que la plateforme sera disponible.</p>
          
          <p>Si vous avez des questions ou des suggestions, n'hésitez pas à nous contacter à <a href="mailto:bonjour@pedagoia.fr" style="color: #2563EB;">bonjour@pedagoia.fr</a></p>
          
          <p style="margin-top: 2em;">À très bientôt !</p>
          <p>L'équipe PedagoIA</p>
        </div>
      `
    }
    console.log("Email data prepared:", emailData)

    console.log("Sending request to Resend API...")
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailData),
    })

    const responseText = await res.text()
    console.log("Resend API response status:", res.status)
    console.log("Resend API response body:", responseText)

    if (res.ok) {
      console.log("✓ Email sent successfully")
      return new Response(responseText, {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    } else {
      console.error("❌ Error from Resend API:", responseText)
      return new Response(JSON.stringify({ error: responseText }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("❌ Error in send-waitlist-welcome function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})