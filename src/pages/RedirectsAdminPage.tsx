
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash, Plus, Save, RotateCcw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Redirect = {
  id: string
  short_path: string
  target_url: string
  click_count: number
  last_clicked_at: string | null
  description: string | null
  created_at: string
}

type RedirectLog = {
  id: string
  redirect_id: string
  clicked_at: string
  user_agent: string | null
  ip_address: string | null
  referer: string | null
}

export default function RedirectsAdminPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [redirects, setRedirects] = useState<Redirect[]>([])
  const [logs, setLogs] = useState<RedirectLog[]>([])
  const [loading, setLoading] = useState(true)
  const [newRedirect, setNewRedirect] = useState({
    short_path: "",
    target_url: "",
    description: ""
  })

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
      const { data, error } = await supabase
        .from('url_redirects')
        .select('*')
        .order('short_path')
      
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
      const { data, error } = await supabase
        .from('redirect_logs')
        .select('*')
        .order('clicked_at', { ascending: false })
        .limit(100)
      
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
      const { error } = await supabase
        .from('url_redirects')
        .insert([
          {
            short_path: newRedirect.short_path,
            target_url: newRedirect.target_url,
            description: newRedirect.description || null
          }
        ])
      
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
      
      fetchRedirects()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Erreur lors de la sauvegarde: ${error.message}`
      })
    }
  }

  const deleteRedirect = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette redirection ?")) {
      return
    }

    try {
      const { error } = await supabase
        .from('url_redirects')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast({
        title: "Succès",
        description: "Redirection supprimée avec succès."
      })
      
      fetchRedirects()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Erreur lors de la suppression: ${error.message}`
      })
    }
  }

  const updateRedirect = async (redirect: Redirect) => {
    try {
      const { error } = await supabase
        .from('url_redirects')
        .update({
          short_path: redirect.short_path,
          target_url: redirect.target_url,
          description: redirect.description
        })
        .eq('id', redirect.id)
      
      if (error) throw error
      
      toast({
        title: "Succès",
        description: "Redirection mise à jour avec succès."
      })
      
      fetchRedirects()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Erreur lors de la mise à jour: ${error.message}`
      })
    }
  }

  const handleFieldChange = (index: number, field: string, value: string) => {
    const updatedRedirects = [...redirects]
    updatedRedirects[index] = {
      ...updatedRedirects[index],
      [field]: value
    }
    setRedirects(updatedRedirects)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Gestion des Redirections</h1>
      
      <Tabs defaultValue="redirects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="redirects">Redirections</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="redirects" className="space-y-6">
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
                    {redirects.map((redirect, index) => (
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
              <Button variant="outline" onClick={fetchRedirects}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Rafraîchir
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytiques des redirections</CardTitle>
              <CardDescription>Statistiques sur l'utilisation des liens courts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Total des clics</h3>
                  <p className="text-3xl font-bold">{redirects.reduce((sum, r) => sum + r.click_count, 0)}</p>
                </div>
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Redirections actives</h3>
                  <p className="text-3xl font-bold">{redirects.length}</p>
                </div>
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Top platformes</h3>
                  <div>
                    <p className="font-semibold">TikTok: {redirects.filter(r => r.short_path?.startsWith('t')).reduce((sum, r) => sum + r.click_count, 0)} clics</p>
                    <p className="font-semibold">Instagram: {redirects.filter(r => r.short_path?.startsWith('i')).reduce((sum, r) => sum + r.click_count, 0)} clics</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Influenceurs</CardTitle>
                <CardDescription>Classement des influenceurs par nombre de clics</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Influenceur</TableHead>
                      <TableHead>Clics totaux</TableHead>
                      <TableHead>Clics TikTok 20%</TableHead>
                      <TableHead>Clics TikTok 40%</TableHead>
                      <TableHead>Clics Instagram 20%</TableHead>
                      <TableHead>Clics Instagram 40%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(new Set(redirects.map(r => {
                      const parts = r.short_path?.split('/');
                      return parts && parts.length > 1 ? parts[1] : null;
                    }).filter(Boolean)))
                      .map(influencer => {
                        const influencerRedirects = redirects.filter(r => r.short_path?.split('/')[1] === influencer);
                        const totalClicks = influencerRedirects.reduce((sum, r) => sum + r.click_count, 0);
                        
                        return {
                          name: influencer,
                          totalClicks,
                          t20: redirects.find(r => r.short_path === `t20/${influencer}`)?.click_count || 0,
                          t40: redirects.find(r => r.short_path === `t40/${influencer}`)?.click_count || 0,
                          i20: redirects.find(r => r.short_path === `i20/${influencer}`)?.click_count || 0,
                          i40: redirects.find(r => r.short_path === `i40/${influencer}`)?.click_count || 0
                        };
                      })
                      .sort((a, b) => b.totalClicks - a.totalClicks)
                      .map(influencer => (
                        <TableRow key={influencer.name}>
                          <TableCell className="font-medium">{influencer.name}</TableCell>
                          <TableCell>{influencer.totalClicks}</TableCell>
                          <TableCell>{influencer.t20}</TableCell>
                          <TableCell>{influencer.t40}</TableCell>
                          <TableCell>{influencer.i20}</TableCell>
                          <TableCell>{influencer.i40}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de redirection</CardTitle>
              <CardDescription>Derniers 100 clics sur les liens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date et heure</TableHead>
                      <TableHead>Redirection</TableHead>
                      <TableHead>Referer</TableHead>
                      <TableHead>User Agent</TableHead>
                      <TableHead>Adresse IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map(log => {
                      const redirect = redirects.find(r => r.id === log.redirect_id);
                      return (
                        <TableRow key={log.id}>
                          <TableCell>{new Date(log.clicked_at).toLocaleString()}</TableCell>
                          <TableCell>{redirect?.short_path || 'Inconnu'}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{log.referer || 'Direct'}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{log.user_agent || 'Inconnu'}</TableCell>
                          <TableCell>{log.ip_address || 'Inconnue'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={fetchLogs}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Rafraîchir
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
