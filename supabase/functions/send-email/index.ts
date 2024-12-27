import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface EmailRequest {
  to: string[]
  subject: string
  html: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const emailRequest: EmailRequest = await req.json()
    console.log("Sending email with request:", emailRequest)

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
        from: "onboarding@resend.dev", // Using Resend's testing email address
        to: emailRequest.to,
        subject: emailRequest.subject,
        html: emailRequest.html,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      console.log("Email sent successfully:", data)
      
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    } else {
      const error = await res.text()
      console.error("Error sending email:", error)
      
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("Error in send-email function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})