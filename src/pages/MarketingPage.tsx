import { useEffect } from "react"
import { UTMGenerator } from "@/components/marketing/UTMGenerator"
import { UTMHistory } from "@/components/marketing/UTMHistory"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function MarketingPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        navigate("/login")
        return
      }

      const email = session.user.email
      if (email !== "andyguitteaud@gmail.com" && email !== "ag.tradeunion@gmail.com") {
        toast({
          variant: "destructive",
          title: "Accès refusé",
          description: "Vous n'avez pas accès à cette page."
        })
        navigate("/")
      }
    }

    checkAccess()
  }, [navigate, toast])

  return (
    <div className="container mx-auto p-4 max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold mb-6">Générateur de liens UTM</h1>
      <UTMGenerator />
      <UTMHistory />
    </div>
  )
}