import { useState } from "react"
import { useForm } from "react-hook-form"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { WaitlistFormFields } from "./waitlist/WaitlistFormFields"
import { SuccessToast } from "./waitlist/SuccessToast"
import { useMailerLite } from "@/hooks/use-mailerlite"

interface WaitlistFormData {
  email: string
  firstName: string
  teachingLevel: string
}

export const WaitlistForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { subscribeToMailerLite } = useMailerLite()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WaitlistFormData>()

  const onSubmit = async (data: WaitlistFormData) => {
    console.log('Submitting form with data:', data)
    setIsLoading(true)
    try {
      // First, try to insert into Supabase
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
        
        // Check if it's a duplicate email error
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
          return
        }
        
        throw supabaseError
      }

      // If Supabase insertion was successful, subscribe to MailerLite
      await subscribeToMailerLite({
        email: data.email,
        firstName: data.firstName,
        teachingLevel: data.teachingLevel
      })

      console.log('Form submitted successfully')
      
      // Close the popup immediately using the Dialog API
      const closeEvent = new Event('close')
      window.dispatchEvent(closeEvent)

      // Show success toast
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md mx-auto">
      <WaitlistFormFields 
        register={register}
        errors={errors}
        isLoading={isLoading}
      />
    </form>
  )
}