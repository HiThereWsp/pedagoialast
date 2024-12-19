import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const Settings = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [firstName, setFirstName] = useState("")
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas."
      })
      setPasswordLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du mot de passe."
      })
    } else {
      toast({
        title: "Succès",
        description: "Votre mot de passe a été mis à jour avec succès."
      })
      setNewPassword("")
      setConfirmPassword("")
    }

    setPasswordLoading(false)
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
          <CardContent className="space-y-6">
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

            <Separator className="my-6" />

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                  />
                </div>
              </div>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Settings