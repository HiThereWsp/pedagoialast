
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BackButton } from "@/components/settings/BackButton"
import { ProfileForm } from "@/components/settings/ProfileForm"
import { PasswordForm } from "@/components/settings/PasswordForm"
import { SEO } from "@/components/SEO"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"

const Settings = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [firstName, setFirstName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true)
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
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [navigate, toast])

  return (
    <>
      <SEO 
        title="Paramètres | PedagoIA - Gérez votre compte"
        description="Personnalisez votre expérience PedagoIA en gérant vos paramètres de compte et vos préférences."
      />
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <BackButton />

          <Card className="border border-border shadow-sm transition-all duration-300 hover:shadow-md">
            <CardHeader className="relative pb-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                    {firstName ? firstName.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {loading ? (
                      <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                        {firstName || "Votre Profil"}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Gérez vos informations personnelles et vos préférences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <ProfileForm initialFirstName={firstName} onUpdate={setFirstName} />
              
              <Separator className="my-6" />
              
              <PasswordForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Settings
