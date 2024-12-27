import { supabase } from "@/integrations/supabase/client"

interface SendEmailParams {
  to: string[]
  subject: string
  html: string
}

export const useEmail = () => {
  const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error("User must be authenticated to send emails")
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ to, subject, html }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to send email")
      }

      return await response.json()
    } catch (error: any) {
      console.error("Error sending email:", error)
      throw error
    }
  }

  return { sendEmail }
}