
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRedirects } from "@/hooks/redirects/useRedirects"
import RedirectForm from "@/components/redirects/RedirectForm"
import RedirectsList from "@/components/redirects/RedirectsList"
import RedirectsAnalytics from "@/components/redirects/RedirectsAnalytics"
import RedirectsLogs from "@/components/redirects/RedirectsLogs"

export default function RedirectsAdminPage() {
  const { redirects, logs, loading, fetchRedirects, fetchLogs } = useRedirects()

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
          <RedirectForm onSuccess={fetchRedirects} />
          <RedirectsList redirects={redirects} onRefresh={fetchRedirects} />
        </TabsContent>
        
        <TabsContent value="analytics">
          <RedirectsAnalytics redirects={redirects} />
        </TabsContent>
        
        <TabsContent value="logs">
          <RedirectsLogs logs={logs} redirects={redirects} onRefresh={fetchLogs} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
