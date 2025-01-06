import { supabase } from "@/integrations/supabase/client"

interface SendEmailParams {
  to: string[]
  subject: string
  html: string
  replyTo?: string
}

export const useEmail = () => {
  const sendEmail = async ({ to, subject, html, replyTo }: SendEmailParams) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error("User must be authenticated to send emails")
      }

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, html, replyTo }
      })

      if (error) {
        console.error("Error sending email:", error)
        throw error
      }

      return data
    } catch (error: any) {
      console.error("Error sending email:", error)
      throw error
    }
  }

  return { sendEmail }
}