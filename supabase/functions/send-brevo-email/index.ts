import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface EmailRequest {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  sender?: { name: string; email: string }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Starting send-brevo-email function...")
    
    const emailRequest: EmailRequest = await req.json()
    console.log("Request data:", emailRequest)

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
        sender: emailRequest.sender || {
          name: "PedagoIA",
          email: "bonjour@pedagoia.fr"
        },
        to: emailRequest.to,
        subject: emailRequest.subject,
        htmlContent: emailRequest.htmlContent,
      }),
    })

    const responseData = await response.text()
    console.log("Brevo API response status:", response.status)
    console.log("Brevo API response body:", responseData)

    if (!response.ok) {
      console.error("❌ Error from Brevo API:", responseData)
      return new Response(
        JSON.stringify({ error: "Failed to send email via Brevo" }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    console.log("✓ Email sent successfully via Brevo")
    return new Response(
      responseData,
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )

  } catch (error) {
    console.error("❌ Error in send-brevo-email function:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})