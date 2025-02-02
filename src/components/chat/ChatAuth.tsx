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
    let subscription: { data: { subscription: { unsubscribe: () => void } } }

    const checkSession = async () => {
      try {
        setIsLoading(true)
        
        // Initialize session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          await handleSignOut()
          return
        }

        if (!session) {
          console.log('No active session found')
          await handleSignOut()
          return
        }

        // Set up auth state change listener
        subscription = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log('Auth state changed:', event)
          
          if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully')
          }
          
          if (event === 'SIGNED_OUT' || !currentSession) {
            await handleSignOut()
            return
          }

          // Update user data on session change
          if (currentSession?.user) {
            await updateUserData(currentSession.user.id)
          }
        })

        // Initial user data setup
        if (session.user) {
          await updateUserData(session.user.id)
        }

      } catch (error) {
        console.error('Error checking session:', error)
        await handleSignOut()
      } finally {
        setIsLoading(false)
      }
    }

    const updateUserData = async (userId: string) => {
      setUserId(userId)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', userId)
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

    const handleSignOut = async () => {
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.error('Error signing out:', error)
      } finally {
        setUserId(null)
        setFirstName("")
        localStorage.removeItem('sb-jpelncawdaounkidvymu-auth-token')
        navigate('/login')
      }
    }

    checkSession()

    return () => {
      subscription?.data?.subscription?.unsubscribe()
    }
  }, [navigate, toast])

  return { userId, firstName, isLoading }
}