import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Settings = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [firstName, setFirstName] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setFirstName(profile.first_name)
      }
    }

    getProfile()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase
      .from('profiles')
      .update({ first_name: firstName })
      .eq('id', session.user.id)

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de votre profil."
      })
    } else {
      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour avec succès."
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres du profil</CardTitle>
            <CardDescription>
              Gérez vos informations personnelles et vos préférences
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Settings