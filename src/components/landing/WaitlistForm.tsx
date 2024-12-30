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
      // D'abord, on inscrit dans Supabase
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
            variant: "destructive",
            title: "Email déjà inscrit",
            description: "Cette adresse email est déjà inscrite à la liste d'attente.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
          })
        }
        return
      }

      // Ensuite, on inscrit dans MailerLite
      await subscribeToMailerLite({
        email: data.email,
        firstName: data.firstName,
        teachingLevel: data.teachingLevel
      })

      console.log('Form submitted successfully')
      
      // Fermer la popup immédiatement en utilisant l'API Dialog de Radix
      const closeEvent = new Event('close')
      window.dispatchEvent(closeEvent)

      // Afficher le toast de succès
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