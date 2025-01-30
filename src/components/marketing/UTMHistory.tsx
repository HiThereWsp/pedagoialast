import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface UTMLink {
  id: string
  base_url: string
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  created_at: string
}

export function UTMHistory() {
  const [links, setLinks] = useState<UTMLink[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchLinks = async () => {
      const { data, error } = await supabase
        .from("utm_links")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching UTM links:", error)
        return
      }

      setLinks(data)
    }

    fetchLinks()
  }, [])

  const generateUTMLink = (link: UTMLink) => {
    const params = new URLSearchParams()
    if (link.utm_source) params.append("utm_source", link.utm_source)
    if (link.utm_medium) params.append("utm_medium", link.utm_medium)
    if (link.utm_campaign) params.append("utm_campaign", link.utm_campaign)
    if (link.utm_content) params.append("utm_content", link.utm_content)

    return `${link.base_url}?${params.toString()}`
  }

  const copyToClipboard = async (link: UTMLink) => {
    const fullLink = generateUTMLink(link)
    try {
      await navigator.clipboard.writeText(fullLink)
      toast({
        description: "Lien UTM copié dans le presse-papier !",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Erreur lors de la copie du lien",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Historique des liens</h2>
      {links.map((link) => (
        <Card key={link.id} className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1 flex-1">
              <p className="font-medium break-all">{link.base_url}</p>
              <div className="text-sm text-muted-foreground">
                <p>Source: {link.utm_source}</p>
                <p>Medium: {link.utm_medium}</p>
                <p>Campaign: {link.utm_campaign}</p>
                <p>Content: {link.utm_content}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(link.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(link)}
              className="ml-2"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="pt-2">
            <p className="text-xs font-mono break-all bg-secondary/20 p-2 rounded">
              {generateUTMLink(link)}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}