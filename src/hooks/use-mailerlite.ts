import { supabase } from "@/integrations/supabase/client"

interface SubscribeToMailerLiteParams {
  email: string
  firstName: string
  teachingLevel?: string
}

export const useMailerLite = () => {
  const subscribeToMailerLite = async ({ 
    email, 
    firstName, 
    teachingLevel 
  }: SubscribeToMailerLiteParams) => {
    try {
      const { data, error } = await supabase.functions.invoke('subscribe-to-mailerlite', {
        body: { email, firstName, teachingLevel }
      })

      if (error) {
        console.error("Error subscribing to MailerLite:", error)
        throw error
      }

      return data
    } catch (error: any) {
      console.error("Error subscribing to MailerLite:", error)
      throw error
    }
  }

  return { subscribeToMailerLite }
}