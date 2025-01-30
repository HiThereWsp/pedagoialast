import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Copy, Link } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function UTMGenerator() {
  const [baseUrl, setBaseUrl] = useState("https://pedagoia.fr")
  const [source, setSource] = useState("")
  const [medium, setMedium] = useState("influencer")
  const [campaign, setCampaign] = useState("")
  const [content, setContent] = useState("")
  const { toast } = useToast()

  const generateUTMLink = () => {
    const params = new URLSearchParams()
    if (source) params.append("utm_source", source)
    if (medium) params.append("utm_medium", medium)
    if (campaign) params.append("utm_campaign", campaign)
    if (content) params.append("utm_content", content)

    return `${baseUrl}?${params.toString()}`
  }

  const copyToClipboard = async () => {
    const link = generateUTMLink()
    try {
      await navigator.clipboard.writeText(link)
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
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="baseUrl">URL de base</Label>
        <Input
          id="baseUrl"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://votresite.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Source (plateforme)</Label>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir une plateforme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaign">Nom de la campagne (influenceur)</Label>
        <Input
          id="campaign"
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
          placeholder="ex: prof_martin"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Type de contenu</Label>
        <Select value={content} onValueChange={setContent}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un type de contenu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="story">Story</SelectItem>
            <SelectItem value="post">Post</SelectItem>
            <SelectItem value="reel">Reel</SelectItem>
            <SelectItem value="video">Vidéo</SelectItem>
            <SelectItem value="bio">Bio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 space-y-4">
        <div className="p-4 bg-secondary/20 rounded-lg break-all">
          <p className="text-sm font-mono">{generateUTMLink()}</p>
        </div>

        <Button onClick={copyToClipboard} className="w-full">
          <Copy className="w-4 h-4 mr-2" />
          Copier le lien UTM
        </Button>
      </div>
    </Card>
  )
}