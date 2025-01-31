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
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          navigate('/login')
          return
        }

        if (!session) {
          console.log('No active session found')
          navigate('/login')
          return
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            if (event === 'SIGNED_OUT' || !currentSession) {
              navigate('/login')
              return
            }
          }
        )

        if (session.user) {
          setUserId(session.user.id)
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            console.error('Error fetching profile:', profileError)
          } else if (profile) {
            setFirstName(profile.first_name)
          }
        }

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error checking session:', error)
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [navigate, toast])

  return { userId, firstName, isLoading }
}