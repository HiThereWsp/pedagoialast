
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Check, User } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

interface ProfileFormProps {
  initialFirstName: string
  onUpdate?: (firstName: string) => void
}

const profileSchema = z.object({
  firstName: z.string().min(2, {
    message: "Le prénom doit contenir au moins 2 caractères.",
  }),
})

export const ProfileForm = ({ initialFirstName, onUpdate }: ProfileFormProps) => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialFirstName,
    },
  })

  useEffect(() => {
    form.reset({ firstName: initialFirstName })
  }, [initialFirstName, form])

  const handleSubmit = async (values: z.infer<typeof profileSchema>) => {
    setLoading(true)
    setSuccess(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { error } = await supabase
        .from('profiles')
        .update({ first_name: values.firstName })
        .eq('id', session.user.id)

      if (error) throw error

      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour."
      })
      
      setSuccess(true)
      if (onUpdate) {
        onUpdate(values.firstName)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour."
      })
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(false), 2000)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="space-y-2">
          <h3 className="text-base font-medium text-muted-foreground">Votre profil</h3>
        </div>
        
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm text-muted-foreground">Prénom</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    placeholder="Votre prénom"
                    className="h-10 text-sm"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={loading}
          size="sm"
          className="w-full transition-all duration-200 mt-2"
        >
          {loading ? (
            "Mise à jour..."
          ) : success ? (
            <>
              <Check className="mr-1 h-4 w-4" /> Mis à jour
            </>
          ) : (
            "Mettre à jour"
          )}
        </Button>
      </form>
    </Form>
  )
}
