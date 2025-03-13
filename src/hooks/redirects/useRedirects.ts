
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { RedirectRow, RedirectLogRow } from "@/types/redirects"

export function useRedirects() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [redirects, setRedirects] = useState<RedirectRow[]>([])
  const [logs, setLogs] = useState<RedirectLogRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        navigate("/login")
        return
      }

      const email = user.email
      if (email !== "andyguitteaud@gmail.com" && email !== "ag.tradeunion@gmail.com") {
        toast({
          variant: "destructive",
          title: "Accès refusé",
          description: "Vous n'avez pas accès à cette page."
        })
        navigate("/")
        return
      }

      fetchRedirects()
      fetchLogs()
    }

    checkAccess()
  }, [navigate, toast])

  const fetchRedirects = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_url_redirects')
      
      if (error) throw error
      setRedirects(data || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Erreur lors du chargement des redirections: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase.rpc('get_redirect_logs')
      
      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Erreur lors du chargement des logs: ${error.message}`
      })
    }
  }

  return { redirects, logs, loading, fetchRedirects, fetchLogs }
}
