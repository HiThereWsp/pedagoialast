import { useState } from "react"
import { useForm } from "react-hook-form"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { WaitlistFormFields } from "./waitlist/WaitlistFormFields"
import { SuccessToast } from "./waitlist/SuccessToast"
import { useRateLimit } from "@/hooks/useRateLimit"

interface WaitlistFormData {
  email: string
  firstName: string
  teachingLevel: string
}

export const WaitlistForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WaitlistFormData>()
  const { checkRateLimit, isLimited } = useRateLimit({ maxRequests: 3, timeWindow: 300000 }) // 5 minutes

  const onSubmit = async (data: WaitlistFormData) => {
    if (!checkRateLimit()) {
      toast({
        variant: "destructive",
        title: "Trop de tentatives",
        description: "Veuillez patienter quelques minutes avant de réessayer.",
      })
      return
    }

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
          // On ferme quand même la modal même si l'email est déjà inscrit
          window.dispatchEvent(new CustomEvent('closeWaitlistModal'))
          return
        }
        
        throw supabaseError
      }

      console.log('Form submitted successfully')
      
      // Utilisation d'un CustomEvent au lieu d'un Event standard
      window.dispatchEvent(new CustomEvent('closeWaitlistModal'))

      toast({
        duration: 3000,
        className: "bg-white dark:bg-gray-800",
        description: <SuccessToast />
      })
      reset()
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto px-4 sm:px-6">
      <WaitlistFormFields 
        register={register}
        errors={errors}
        isLoading={isLoading || isLimited}
      />
    </form>
  )
}