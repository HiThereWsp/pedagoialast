import React from 'react'
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import {FunctionsFetchError, FunctionsHttpError, FunctionsRelayError, User} from "@supabase/supabase-js"
import { HomeSkeleton } from "@/components/home/HomeSkeleton"
import { UserMenu } from "@/components/home/UserMenu"
import { WelcomeMessage } from "@/components/home/WelcomeMessage"
import { ActionButtons } from "@/components/home/ActionButtons"
import { Footer } from "@/components/home/Footer"
import { UpdateNotification } from "@/components/home/UpdateNotification"
import { useToast } from "@/hooks/use-toast"
import { SEO } from "@/components/SEO"
import { Tiles } from "@/components/ui/tiles"
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
      if (session?.user?.email_confirmed_at){
        const {data: user_profiles, error} = await supabase.from('user_profiles').select('*').eq('user_email', session.user.email);
        console.log({user_profiles})
        console.log("EMAIL", session.user.email)
        console.log({error})
        // if(user_profiles)
        if(user_profiles && !user_profiles[0].welcome_email_sent){
          try {
            const { data: emailData, error: emailError } = await supabase.functions.invoke(
                "send-welcome-emails-after-signup",
                {
                  body: {
                    type: "welcome",
                    email: session.user?.email,
                  },
                }
            );
            if (emailError) {
              if (emailError instanceof FunctionsHttpError) {
                const errorMessage = await emailError.context.json();
                console.error("Function error:", errorMessage);
              } else if (emailError instanceof FunctionsRelayError) {
                console.error("Relay error:", emailError.message);
              } else if (emailError instanceof FunctionsFetchError) {
                console.error("Fetch error:", emailError.message);
              }
              console.log("Welcome email data:", emailData);
            }else{
              const { data, error } = await supabase
                  .from('user_profiles')
                  .update({ welcome_email_sent: true })
                  .eq('user_email', session.user?.email)
                  .select()
            }
          } catch (emailErr) {
            console.error("Email sending failed:", emailErr);
          }
        }
      }
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
      <>
        <SEO
            title="Tableau de bord | PedagoIA - Votre assistant pédagogique"
            description="Accédez à tous vos outils pédagogiques et gérez vos contenus depuis votre tableau de bord personnalisé."
        />
        <div className="relative min-h-screen">
          <div className="fixed inset-0 overflow-hidden">
            <Tiles
                rows={50}
                cols={8}
                tileSize="md"
                className="opacity-30"
            />
          </div>
          <div className="relative z-10 min-h-screen flex flex-col items-center px-6 py-8 max-w-md mx-auto">
            <UserMenu />
            <WelcomeMessage firstName={firstName} />
            <ActionButtons />
            <Footer />
            <UpdateNotification />
          </div>
        </div>
      </>
  )
}
export default Home