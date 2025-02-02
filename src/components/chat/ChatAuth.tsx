import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export const useChatAuth = () => {
  const [userId, setUserId] = useState<string | null>(null)
  const [firstName, setFirstName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true)
        
        // Clear any stale session data
        const currentSession = await supabase.auth.getSession()
        
        if (!currentSession.data.session) {
          console.log('No active session found')
          // Clear local storage to remove any stale tokens
          localStorage.removeItem('sb-jpelncawdaounkidvymu-auth-token')
          navigate('/login')
          return
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event)
            
            if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed successfully')
            }
            
            if (event === 'SIGNED_OUT' || !session) {
              localStorage.removeItem('sb-jpelncawdaounkidvymu-auth-token')
              navigate('/login')
              return
            }
          }
        )

        if (currentSession.data.session.user) {
          setUserId(currentSession.data.session.user.id)
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', currentSession.data.session.user.id)
            .single()

          if (profileError) {
            console.error('Error fetching profile:', profileError)
            toast({
              variant: "destructive",
              title: "Erreur",
              description: "Impossible de charger votre profil"
            })
          } else if (profile) {
            setFirstName(profile.first_name)
          }
        }

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error checking session:', error)
        localStorage.removeItem('sb-jpelncawdaounkidvymu-auth-token')
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [navigate, toast])

  return { userId, firstName, isLoading }
}