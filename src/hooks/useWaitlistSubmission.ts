import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { SuccessToast } from "@/components/landing/waitlist/SuccessToast"

interface WaitlistFormData {
  email: string
  firstName: string
  teachingLevel: string
}

export const useWaitlistSubmission = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const submitWaitlistForm = async (data: WaitlistFormData) => {
    console.log('Submitting form with data:', data)
    setIsLoading(true)
    try {
      const { error: supabaseError } = await supabase
        .from('waitlist')
        .insert([
          {
            email: data.email,
            first_name: data.firstName,
            teaching_level: data.teachingLevel
          }
        ])

      if (supabaseError) {
        console.error('Supabase error details:', supabaseError)
        
        if (supabaseError.code === '23505') {
          toast({
            variant: "default",
            className: "bg-primary/10 border-primary/20",
            title: "Vous êtes déjà inscrit ! 🎉",
            description: (
              <div className="space-y-2">
                <p>Merci pour votre enthousiasme ! Nous avons bien noté votre intérêt.</p>
                <p className="text-sm text-muted-foreground">
                  Une question ? Contactez-nous à{" "}
                  <a 
                    href="mailto:bonjour@pedagoia.fr" 
                    className="text-primary hover:underline"
                  >
                    bonjour@pedagoia.fr
                  </a>
                </p>
              </div>
            ),
          })
          setIsLoading(false)
          window.dispatchEvent(new CustomEvent('closeWaitlistModal'))
          return
        }
        
        throw supabaseError
      }

      console.log('Form submitted successfully')
      
      window.dispatchEvent(new CustomEvent('closeWaitlistModal'))

      toast({
        duration: 3000,
        className: "bg-white dark:bg-gray-800",
        description: <SuccessToast />
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    submitWaitlistForm
  }
}