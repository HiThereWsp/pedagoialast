import { supabase } from "@/integrations/supabase/client"

export const testSupabaseConnection = async () => {
  try {
    // Test de la session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error("Erreur de session:", sessionError)
      return
    }
    
    console.log("Session active:", session)
    
    // Test d'envoi d'email via la fonction Edge
    if (session) {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: "votre@email.com",
          subject: "Test Email",
          text: "Ceci est un email de test"
        }
      })
      
      if (error) {
        console.error("Erreur d'envoi d'email:", error)
        return
      }
      
      console.log("Réponse de la fonction d'envoi d'email:", data)
    }
  } catch (error) {
    console.error("Erreur générale:", error)
  }
}