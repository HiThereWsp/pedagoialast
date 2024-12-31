import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { LoginForm } from "@/components/landing/LoginForm"
import { Card, CardContent } from "@/components/ui/card"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const returnUrl = location.state?.returnUrl || '/chat'
        navigate(returnUrl, { replace: true })
      }
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const returnUrl = location.state?.returnUrl || '/chat'
        navigate(returnUrl, { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate, location.state])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Assistant Pédagogique IA
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Connectez-vous pour continuer
            </p>
          </div>
          
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}