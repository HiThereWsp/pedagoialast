
import React from 'react';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Copy, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { BugReportRow } from '@/types/database/tables';
import { useToast } from '@/hooks/use-toast';

interface BugReportTableProps {
  reports: BugReportRow[];
  userEmails: Record<string, string>;
  onViewDetails: (report: BugReportRow) => void;
}

export const BugReportTable: React.FC<BugReportTableProps> = ({ 
  reports, 
  userEmails, 
  onViewDetails 
}) => {
  const { toast } = useToast();

  // Format date
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy, HH:mm', { locale: fr });
  };

  // Copy email to clipboard
  const copyEmailToClipboard = (email: string, event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(email)
      .then(() => {
        toast({
          title: 'Email Copied',
          description: 'Email address copied to clipboard',
        });
      })
      .catch((error) => {
        console.error('Error copying email:', error);
        toast({
          title: 'Error',
          description: 'Failed to copy email to clipboard',
          variant: 'destructive',
        });
      });
  };

  // Open URL in new tab
  const openUrl = (url: string, event: React.MouseEvent) => {
    event.stopPropagation();
    window.open(url, '_blank');
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default" className="bg-blue-500">Nouveau</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-amber-500">En cours</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-500">Résolu</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto mt-4">
      <Table>
        <TableCaption>Liste des signalements de bugs</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow 
              key={report.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onViewDetails(report)}
            >
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{formatDate(report.created_at)}</span>
                </div>
              </TableCell>
              <TableCell>
                {report.user_id && userEmails[report.user_id] ? (
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-32">{userEmails[report.user_id]}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => copyEmailToClipboard(userEmails[report.user_id], e)}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Anonyme</span>
                )}
              </TableCell>
              <TableCell>
                <div className="truncate max-w-60">
                  {report.description}
                </div>
              </TableCell>
              <TableCell>
                {report.url ? (
                  <div className="flex items-center gap-2 truncate max-w-32">
                    <span className="truncate">{report.url}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => openUrl(report.url as string, e)}
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </div>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell>
                {getStatusBadge(report.status)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(report);
                  }}
                >
                  Détails
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
