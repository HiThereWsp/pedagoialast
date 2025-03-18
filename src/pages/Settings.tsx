
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
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { DashboardWrapper } from "@/components/dashboard/DashboardWrapper"

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
      <DashboardWrapper>
        <div className="min-h-screen p-6">
          <div className="max-w-md mx-auto space-y-6">
            <BackButton />

            <Card className="shadow-sm border overflow-hidden relative">
              <CardHeader className="flex items-center justify-center pb-2">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-16 w-16 bg-primary/5">
                    <AvatarFallback className="text-primary">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    {loading ? (
                      <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <span className="text-lg font-medium text-muted-foreground">
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
      </DashboardWrapper>
    </>
  )
}

export default Settings
