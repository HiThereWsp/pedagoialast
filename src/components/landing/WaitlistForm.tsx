import { useState } from "react"
import { useForm } from "react-hook-form"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { WaitlistFormFields } from "./waitlist/WaitlistFormFields"
import { SuccessToast } from "./waitlist/SuccessToast"
import { useRateLimit } from "@/hooks/useRateLimit"
import { posthog } from "@/integrations/posthog/client"

interface WaitlistFormData {
  email: string
  firstName: string
  teachingLevel: string
}

export const WaitlistForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WaitlistFormData>()
  const { checkRateLimit, isLimited } = useRateLimit({ maxRequests: 3, timeWindow: 300000 })

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
          // Track duplicate signup attempt
          posthog.capture('waitlist_duplicate_signup', {
            email: data.email,
            teaching_level: data.teachingLevel
          })
          
          toast({
            variant: "default",
            className: "bg-primary/10 border-primary/20",
            title: "Vous faites déjà partie de l'aventure ! 🎉",
            description: (
              <div className="space-y-2">
                <p>Merci pour votre enthousiasme ! Nous sommes ravis de voir que vous êtes impatient(e) de commencer.</p>
                <p>Nous vous contacterons dès que possible pour vous donner accès à la plateforme.</p>
                <p className="text-sm text-muted-foreground">
                  Une question en attendant ? Contactez-nous à{" "}
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

      // Track successful waitlist signup
      posthog.capture('waitlist_signup_success', {
        teaching_level: data.teachingLevel
      })

      console.log('Form submitted successfully')
      
      window.dispatchEvent(new CustomEvent('closeWaitlistModal'))

      toast({
        duration: 3000,
        className: "bg-white dark:bg-gray-800",
        description: <SuccessToast />
      })
      reset()
    } catch (error) {
      console.error('Error submitting form:', error)
      
      // Track signup error
      posthog.capture('waitlist_signup_error', {
        error: error.message
      })
      
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