
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw } from "lucide-react"
import { RedirectRow, RedirectLogRow } from "@/types/redirects"

interface RedirectsLogsProps {
  logs: RedirectLogRow[]
  redirects: RedirectRow[]
  onRefresh: () => void
}

export default function RedirectsLogs({ logs, redirects, onRefresh }: RedirectsLogsProps) {
  return (
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
        <Button variant="outline" onClick={onRefresh}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Rafraîchir
        </Button>
      </CardFooter>
    </Card>
  )
}
