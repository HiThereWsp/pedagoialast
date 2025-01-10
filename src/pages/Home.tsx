import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import type { User } from "@supabase/supabase-js"
import { HomeSkeleton } from "@/components/home/HomeSkeleton"
import { UserMenu } from "@/components/home/UserMenu"
import { WelcomeMessage } from "@/components/home/WelcomeMessage"
import { ActionButtons } from "@/components/home/ActionButtons"
import { Footer } from "@/components/home/Footer"

const Home = () => {
  const [user, setUser] = useState<User | null>(null)
  const [firstName, setFirstName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            setFirstName(profile.first_name)
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    getUser()
  }, [])

  if (isLoading) {
    return <HomeSkeleton />
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-8 max-w-md mx-auto">
      <UserMenu />
      <WelcomeMessage firstName={firstName} />
      <ActionButtons />
      <Footer />
    </div>
  )
}

export default Home