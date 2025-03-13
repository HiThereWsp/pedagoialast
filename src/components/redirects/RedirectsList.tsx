
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw, Save, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { RedirectRow } from "@/types/redirects"

interface RedirectsListProps {
  redirects: RedirectRow[]
  onRefresh: () => void
}

export default function RedirectsList({ redirects, onRefresh }: RedirectsListProps) {
  const { toast } = useToast()
  const [localRedirects, setLocalRedirects] = useState<RedirectRow[]>(redirects)

  // Update local state when props change
  useState(() => {
    setLocalRedirects(redirects)
  })

  const handleFieldChange = (index: number, field: string, value: string) => {
    const updatedRedirects = [...localRedirects]
    updatedRedirects[index] = {
      ...updatedRedirects[index],
      [field]: value
    }
    setLocalRedirects(updatedRedirects)
  }

  const updateRedirect = async (redirect: RedirectRow) => {
    try {
      const { error } = await supabase.rpc('update_url_redirect', {
        p_id: redirect.id,
        p_short_path: redirect.short_path,
        p_target_url: redirect.target_url,
        p_description: redirect.description
      })
      
      if (error) throw error
      
      toast({
        title: "Succès",
        description: "Redirection mise à jour avec succès."
      })
      
      onRefresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Erreur lors de la mise à jour: ${error.message}`
      })
    }
  }

  const deleteRedirect = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette redirection ?")) {
      return
    }

    try {
      const { error } = await supabase.rpc('delete_url_redirect', {
        p_id: id
      })
      
      if (error) throw error
      
      toast({
        title: "Succès",
        description: "Redirection supprimée avec succès."
      })
      
      onRefresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Erreur lors de la suppression: ${error.message}`
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redirections existantes</CardTitle>
        <CardDescription>Gérez vos redirections existantes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chemin court</TableHead>
                <TableHead>URL Cible</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Clics</TableHead>
                <TableHead>Dernier clic</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localRedirects.map((redirect, index) => (
                <TableRow key={redirect.id}>
                  <TableCell>
                    <Input
                      value={redirect.short_path}
                      onChange={(e) => handleFieldChange(index, 'short_path', e.target.value)}
                      className="min-w-[150px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={redirect.target_url}
                      onChange={(e) => handleFieldChange(index, 'target_url', e.target.value)}
                      className="min-w-[250px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={redirect.description || ''}
                      onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>{redirect.click_count}</TableCell>
                  <TableCell>{redirect.last_clicked_at ? new Date(redirect.last_clicked_at).toLocaleString() : 'Jamais'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateRedirect(redirect)}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteRedirect(redirect.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onRefresh}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Rafraîchir
        </Button>
      </CardFooter>
    </Card>
  )
}
