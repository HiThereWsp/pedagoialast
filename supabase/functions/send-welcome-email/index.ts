import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface WelcomeEmailRequest {
  email: string
  firstName: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, firstName }: WelcomeEmailRequest = await req.json()
    console.log("Sending welcome email to:", email, "firstName:", firstName)

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set")
      throw new Error("RESEND_API_KEY is not configured")
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "PedagoIA <bonjour@pedagoia.fr>",
        to: [email],
        subject: "Bienvenue sur PedagoIA ! 🎉",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Bienvenue ${firstName} !</h1>
            <p>Nous sommes ravis de vous accueillir sur PedagoIA.</p>
            <p>Notre assistant pédagogique est là pour vous aider à créer des contenus pédagogiques de qualité.</p>
            <p>N'hésitez pas à explorer toutes les fonctionnalités disponibles et à nous faire part de vos retours !</p>
            <p>À très bientôt,</p>
            <p>L'équipe PedagoIA</p>
          </div>
        `,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      console.log("Welcome email sent successfully:", data)
      
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    } else {
      const error = await res.text()
      console.error("Error sending welcome email:", error)
      
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("Error in send-welcome-email function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})