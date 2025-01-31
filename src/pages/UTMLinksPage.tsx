import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { UTMGenerator } from "@/components/marketing/UTMGenerator"
import { UTMHistory } from "@/components/marketing/UTMHistory"

export default function UTMLinksPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !['andyguitteaud@gmail.com', 'ag.tradeunion@gmail.com'].includes(user.email || '')) {
        navigate('/login')
      }
    }
    checkAccess()
  }, [navigate])

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Générateur de liens UTM</h1>
      <div className="space-y-8">
        <UTMGenerator />
        <UTMHistory />
      </div>
    </div>
  )
}