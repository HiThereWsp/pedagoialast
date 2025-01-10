import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import type { User } from "@supabase/supabase-js"
import { HomeSkeleton } from "@/components/home/HomeSkeleton"
import { UserMenu } from "@/components/home/UserMenu"
import { WelcomeMessage } from "@/components/home/WelcomeMessage"
import { ActionButtons } from "@/components/home/ActionButtons"
import { Footer } from "@/components/home/Footer"
import { UpdateNotification } from "@/components/home/UpdateNotification"
import { useToast } from "@/hooks/use-toast"

const Home = () => {
  const [user, setUser] = useState<User | null>(null)
  const [firstName, setFirstName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error("Session error:", sessionError)
          throw sessionError
        }

        if (!session) {
          navigate('/login')
          return
        }

        setUser(session.user)

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', session.user.id)
          .single()
        
        if (profileError) {
          console.error("Error fetching profile:", profileError)
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de charger votre profil"
          })
          return
        }
        
        if (profile) {
          setFirstName(profile.first_name)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate, toast])

  if (isLoading) {
    return <HomeSkeleton />
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-8 max-w-md mx-auto">
      <UserMenu />
      <WelcomeMessage firstName={firstName} />
      <ActionButtons />
      <Footer />
      <UpdateNotification />
    </div>
  )
}

export default Home