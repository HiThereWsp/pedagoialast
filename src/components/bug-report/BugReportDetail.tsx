
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, Copy, ExternalLink, Mail, Info, Monitor } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import type { BugReportRow } from '@/types/database/tables';

interface BugReportDetailProps {
  report: BugReportRow;
  userEmail: string;
  onClose: () => void;
  onStatusChange: (reportId: string, newStatus: 'new' | 'in_progress' | 'resolved') => Promise<void>;
}

export const BugReportDetail: React.FC<BugReportDetailProps> = ({
  report,
  userEmail,
  onClose,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<string>(report.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { toast } = useToast();

  // Format date
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy, HH:mm', { locale: fr });
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: 'Copié',
          description: `${label} copié dans le presse-papier`,
        });
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de copier dans le presse-papier',
          variant: 'destructive',
        });
      });
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;
    
    setIsUpdatingStatus(true);
    try {
      await onStatusChange(report.id, newStatus as 'new' | 'in_progress' | 'resolved');
      setStatus(newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Parse browser info JSON if available
  const browserInfo = report.browser_info ? 
    (typeof report.browser_info === 'string' ? 
      JSON.parse(report.browser_info) : 
      report.browser_info) : 
    null;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" onClick={onClose} className="p-0 h-auto">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle>Détail du signalement</CardTitle>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Signalé le {formatDate(report.created_at)}
            </span>
          </div>
          
          <div>
            <Select value={status} onValueChange={handleStatusChange} disabled={isUpdatingStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="resolved">Résolu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* User Information */}
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informations utilisateur
          </h3>
          <div className="bg-muted p-4 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{userEmail || 'Anonyme'}</span>
              {userEmail && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(userEmail, 'Email')}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
            {report.description}
          </div>
        </div>
        
        {/* Screenshot */}
        {report.screenshot_url && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Capture d'écran</h3>
            <div className="border rounded-md overflow-hidden">
              <img 
                src={report.screenshot_url} 
                alt="Bug screenshot" 
                className="w-full h-auto object-contain max-h-96"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+non+disponible';
                }}
              />
            </div>
          </div>
        )}
        
        {/* Technical Information */}
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Informations techniques
          </h3>
          <div className="bg-muted p-4 rounded-md space-y-2">
            {/* URL */}
            {report.url && (
              <div className="flex items-center gap-2">
                <span className="font-medium">URL:</span>
                <span className="flex-1 truncate">{report.url}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open(report.url, '_blank')}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(report.url, 'URL')}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Browser Info */}
            {browserInfo && (
              <>
                <Separator />
                <div className="space-y-1">
                  {browserInfo.userAgent && (
                    <div className="text-sm">
                      <span className="font-medium">User Agent:</span> {browserInfo.userAgent}
                    </div>
                  )}
                  {browserInfo.screenSize && (
                    <div className="text-sm">
                      <span className="font-medium">Taille d'écran:</span> {browserInfo.screenSize}
                    </div>
                  )}
                  {browserInfo.platform && (
                    <div className="text-sm">
                      <span className="font-medium">Plateforme:</span> {browserInfo.platform}
                    </div>
                  )}
                  {browserInfo.language && (
                    <div className="text-sm">
                      <span className="font-medium">Langue:</span> {browserInfo.language}
                    </div>
                  )}
                  {browserInfo.referrer && (
                    <div className="text-sm">
                      <span className="font-medium">Référent:</span> {browserInfo.referrer}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-6">
        <Button variant="outline" onClick={onClose}>
          Retour à la liste
        </Button>
        
        <div className="space-x-2">
          {status !== 'resolved' && (
            <Button 
              variant="default" 
              onClick={() => handleStatusChange('resolved')}
              disabled={isUpdatingStatus}
            >
              Marquer comme résolu
            </Button>
          )}
          {status === 'new' && (
            <Button 
              variant="secondary"

              onClick={() => handleStatusChange('in_progress')}
              disabled={isUpdatingStatus}
            >
              Prendre en charge
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
