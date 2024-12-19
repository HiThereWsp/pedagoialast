import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BackButton } from "@/components/settings/BackButton"
import { ProfileForm } from "@/components/settings/ProfileForm"
import { PasswordForm } from "@/components/settings/PasswordForm"

const Settings = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [firstName, setFirstName] = useState("")

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', session.user.id)
          .maybeSingle()

        if (error) throw error

        if (!profile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ id: session.user.id, first_name: 'Anonymous' }])
          
          if (insertError) throw insertError
          
          setFirstName('Anonymous')
        } else {
          setFirstName(profile.first_name)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger votre profil."
        })
      }
    }

    getProfile()
  }, [navigate, toast])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <BackButton />

        <Card>
          <CardHeader>
            <CardTitle>Paramètres du profil</CardTitle>
            <CardDescription>
              Gérez vos informations personnelles et vos préférences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProfileForm initialFirstName={firstName} />
            
            <Separator className="my-6" />
            
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Settings