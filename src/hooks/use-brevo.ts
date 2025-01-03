import { supabase } from "@/integrations/supabase/client"

interface SendEmailParams {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  sender?: { name: string; email: string }
}

export const useBrevo = () => {
  const sendEmail = async (params: SendEmailParams) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error("User must be authenticated to send emails")
      }

      const { data, error } = await supabase.functions.invoke('send-brevo-email', {
        body: params
      })

      if (error) {
        console.error("Error sending email via Brevo:", error)
        throw error
      }

      console.log("Email sent successfully via Brevo:", data)
      return data
    } catch (error: any) {
      console.error("Error in useBrevo hook:", error)
      throw error
    }
  }

  return { sendEmail }
}