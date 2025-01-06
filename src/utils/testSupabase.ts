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
          to: ["votre@email.com"],  // Notez que 'to' doit être un tableau
          subject: "Test Email",
          html: "<p>Ceci est un email de test</p>"  // Utilisation de 'html' au lieu de 'text'
        }
      })
      
      if (error) {
        console.error("Erreur d'envoi d'email:", error)
        console.error("Message d'erreur complet:", error.message)
        return
      }
      
      console.log("Réponse de la fonction d'envoi d'email:", data)
    }
  } catch (error) {
    console.error("Erreur générale:", error)
    if (error instanceof Error) {
      console.error("Message d'erreur complet:", error.message)
      console.error("Stack trace:", error.stack)
    }
  }
}