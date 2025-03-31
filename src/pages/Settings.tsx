
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BackButton } from "@/components/settings/BackButton"
import { ProfileForm } from "@/components/settings/ProfileForm"
import { PasswordForm } from "@/components/settings/PasswordForm"
import { CancellationButton } from "@/components/settings/CancellationButton"
import { SEO } from "@/components/SEO"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Crown, User } from "lucide-react"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { DashboardWrapper } from "@/components/dashboard/DashboardWrapper"
import { useSubscription } from "@/hooks/useSubscription"
import { Badge } from "@/components/ui/badge"

const Settings = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isSubscribed, subscriptionType } = useSubscription()
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
        <div className="min-h-screen p-6 py-12">
          <div className="max-w-md mx-auto space-y-8">
            <BackButton fallbackPath="/tableaudebord" />

            <Card className="shadow-md border overflow-hidden relative bg-card/95 backdrop-blur-sm">
              <CardHeader className="flex items-center justify-center pb-4">
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="h-20 w-20 bg-primary/5 shadow-sm">
                    <AvatarFallback className="text-primary">
                      <User className="h-9 w-9 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    {loading ? (
                      <div className="h-6 w-36 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <span className="text-xl font-medium text-muted-foreground">
                        {firstName || "Votre Profil"}
                      </span>
                    )}
                    {isSubscribed && subscriptionType && (
                      <div className="mt-2">
                        <Badge 
                          variant="outline" 
                          className="mx-auto font-semibold px-3 py-1 border-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-indigo-400 text-white shadow-sm flex items-center gap-1"
                        >
                          <Crown className="h-3.5 w-3.5" />
                          Forfait Premium
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8 pt-2 px-6 pb-8">
                <ProfileForm initialFirstName={firstName} onUpdate={setFirstName} />
                
                <Separator className="my-8" />
                
                <PasswordForm />

                {isSubscribed && (
                  <>
                    <Separator className="my-8" />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Gestion de l'abonnement</h3>
                      <CancellationButton />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardWrapper>
    </>
  )
}

export default Settings
