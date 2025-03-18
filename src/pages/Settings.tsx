
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
        <div className="max-w-md mx-auto space-y-6">
          <BackButton />

          <Card className="border-0 shadow-sm">
            <CardHeader className="relative pb-0 space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary/5">
                  <AvatarFallback className="text-primary text-sm">
                    {firstName ? firstName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="text-muted-foreground text-sm">
                  {loading ? (
                    <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
                  ) : (
                    <span>
                      {firstName || "Votre Profil"}
                    </span>
                  )}
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
