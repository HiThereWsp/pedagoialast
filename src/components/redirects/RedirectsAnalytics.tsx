
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RedirectRow } from "@/types/redirects"

interface RedirectsAnalyticsProps {
  redirects: RedirectRow[]
}

export default function RedirectsAnalytics({ redirects }: RedirectsAnalyticsProps) {
  // Calculate analytics data
  const totalClicks = redirects.reduce((sum, r) => sum + r.click_count, 0)
  const tiktokClicks = redirects.filter(r => r.short_path?.startsWith('t')).reduce((sum, r) => sum + r.click_count, 0)
  const instagramClicks = redirects.filter(r => r.short_path?.startsWith('i')).reduce((sum, r) => sum + r.click_count, 0)

  // Get unique influencers and their stats
  const influencerStats = Array.from(new Set(redirects.map(r => {
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
    .sort((a, b) => b.totalClicks - a.totalClicks);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Analytiques des redirections</CardTitle>
          <CardDescription>Statistiques sur l'utilisation des liens courts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-secondary/20 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Total des clics</h3>
              <p className="text-3xl font-bold">{totalClicks}</p>
            </div>
            <div className="bg-secondary/20 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Redirections actives</h3>
              <p className="text-3xl font-bold">{redirects.length}</p>
            </div>
            <div className="bg-secondary/20 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Top platformes</h3>
              <div>
                <p className="font-semibold">TikTok: {tiktokClicks} clics</p>
                <p className="font-semibold">Instagram: {instagramClicks} clics</p>
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
                {influencerStats.map(influencer => (
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
    </>
  )
}
