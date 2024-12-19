import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface ProfileFormProps {
  initialFirstName: string
}

export const ProfileForm = ({ initialFirstName }: ProfileFormProps) => {
  const [firstName, setFirstName] = useState(initialFirstName)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { error } = await supabase
        .from('profiles')
        .update({ first_name: firstName })
        .eq('id', session.user.id)

      if (error) throw error

      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour avec succès."
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de votre profil."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">Prénom</Label>
        <Input
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Votre prénom"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Mise à jour..." : "Mettre à jour"}
      </Button>
    </form>
  )
}