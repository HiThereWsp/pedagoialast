import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface WaitlistFormData {
  email: string
  firstName: string
  teachingLevel: string
}

export const WaitlistForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WaitlistFormData>()

  const onSubmit = async (data: WaitlistFormData) => {
    console.log('Début de la soumission du formulaire avec les données:', data)
    setIsLoading(true)
    try {
      // Test de la connexion à Supabase
      const { data: testData, error: testError } = await supabase
        .from('waitlist')
        .select('*')
        .limit(1)
      
      if (testError) {
        console.error('Erreur de test de connexion Supabase:', testError)
        throw new Error('Erreur de connexion à la base de données')
      }
      
      console.log('Test de connexion réussi:', testData)

      // Tentative d'insertion
      const { error } = await supabase
        .from('waitlist')
        .insert([
          {
            email: data.email,
            first_name: data.firstName,
            teaching_level: data.teachingLevel
          }
        ])

      if (error) {
        console.error('Détails de l\'erreur Supabase:', error)
        if (error.code === '23505') {
          toast({
            variant: "destructive",
            title: "Email déjà inscrit",
            description: "Cette adresse email est déjà inscrite à la liste d'attente.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Erreur lors de l'inscription",
            description: `Une erreur est survenue: ${error.message}`,
          })
        }
        return
      }

      console.log('Formulaire soumis avec succès')
      toast({
        title: "Inscription réussie !",
        description: "Nous vous contacterons dès que la plateforme sera disponible.",
      })
      reset()
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error)
      toast({
        variant: "destructive",
        title: "Erreur lors de l'inscription",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md mx-auto">
      <div>
        <Input
          placeholder="Votre prénom"
          {...register("firstName", { required: "Le prénom est requis" })}
          className="w-full"
          disabled={isLoading}
        />
        {errors.firstName && (
          <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <Input
          type="email"
          placeholder="Votre email"
          {...register("email", { 
            required: "L'email est requis",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Email invalide"
            }
          })}
          className="w-full"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Textarea
          placeholder="Votre niveau d'enseignement"
          {...register("teachingLevel", { required: "Le niveau d'enseignement est requis" })}
          className="w-full"
          disabled={isLoading}
        />
        {errors.teachingLevel && (
          <p className="text-sm text-red-500 mt-1">{errors.teachingLevel.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90 text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Inscription en cours...
          </>
        ) : (
          "Je m'inscris à la liste d'attente"
        )}
      </Button>
    </form>
  )
}