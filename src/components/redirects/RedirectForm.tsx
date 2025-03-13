
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface RedirectFormProps {
  onSuccess: () => void
}

export default function RedirectForm({ onSuccess }: RedirectFormProps) {
  const { toast } = useToast()
  const [newRedirect, setNewRedirect] = useState({
    short_path: "",
    target_url: "",
    description: ""
  })

  const saveRedirect = async () => {
    if (!newRedirect.short_path || !newRedirect.target_url) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le chemin court et l'URL cible sont requis."
      })
      return
    }

    try {
      const { error } = await supabase.rpc('insert_url_redirect', {
        p_short_path: newRedirect.short_path,
        p_target_url: newRedirect.target_url,
        p_description: newRedirect.description || null
      })
      
      if (error) throw error
      
      toast({
        title: "Succès",
        description: "Redirection ajoutée avec succès."
      })
      
      setNewRedirect({
        short_path: "",
        target_url: "",
        description: ""
      })
      
      onSuccess()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Erreur lors de la sauvegarde: ${error.message}`
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter une nouvelle redirection</CardTitle>
        <CardDescription>
          Créez un lien court qui redirigera vers l'URL cible avec les paramètres UTM
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="short_path" className="text-sm font-medium">Chemin court</label>
            <Input
              id="short_path"
              placeholder="Ex: t20/influenceur"
              value={newRedirect.short_path}
              onChange={(e) => setNewRedirect({...newRedirect, short_path: e.target.value})}
            />
            <p className="text-xs text-gray-500">Format: t20/nom, t40/nom, i20/nom, i40/nom</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="target_url" className="text-sm font-medium">URL Cible</label>
            <Input
              id="target_url"
              placeholder="https://pedagoia.fr/?utm_source=..."
              value={newRedirect.target_url}
              onChange={(e) => setNewRedirect({...newRedirect, target_url: e.target.value})}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <Textarea
            id="description"
            placeholder="Description de la redirection"
            value={newRedirect.description}
            onChange={(e) => setNewRedirect({...newRedirect, description: e.target.value})}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveRedirect}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </CardFooter>
    </Card>
  )
}
