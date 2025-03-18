
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Check } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const passwordSchema = z.object({
  newPassword: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
})

export const PasswordForm = () => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  const handleSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setLoading(true)
    setSuccess(false)

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword
      })

      if (error) throw error

      toast({
        title: "Succès",
        description: "Votre mot de passe a été mis à jour."
      })
      
      form.reset({
        newPassword: "",
        confirmPassword: "",
      })
      setSuccess(true)
    } catch (error) {
      console.error('Error updating password:', error)
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">Sécurité</h3>
        </div>

        <div className="space-y-3">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs text-muted-foreground">Nouveau mot de passe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type="password"
                      placeholder="Nouveau mot de passe"
                      className="h-9 text-sm"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs text-muted-foreground">Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type="password"
                      placeholder="Confirmer le mot de passe"
                      className="h-9 text-sm"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={loading}
          size="sm"
          variant="outline"
          className="w-full transition-all duration-200 text-xs"
        >
          {loading ? (
            "Mise à jour..."
          ) : success ? (
            <>
              <Check className="mr-1 h-3 w-3" /> Mot de passe mis à jour
            </>
          ) : (
            "Mettre à jour le mot de passe"
          )}
        </Button>
      </form>
    </Form>
  )
}
