
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/SEO';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ArrowLeft, Filter, Search, Calendar, Copy, ExternalLink } from 'lucide-react';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { BugReportDetail } from '@/components/bug-report/BugReportDetail';
import { BugReportFilters } from '@/components/bug-report/BugReportFilters';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { BugReportRow } from '@/types/database/tables';

export default function AdminBugReportsPage() {
  const [bugReports, setBugReports] = useState<BugReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<BugReportRow | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const itemsPerPage = 10;

  const { user, authReady } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch bug reports from Supabase
  const fetchBugReports = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (searchTerm) {
        // Fix: Use proper operators for each field type
        // For JSONB field, cast to text before using ilike
        query = query.or(
          `description.ilike.%${searchTerm}%,` + 
          `url.ilike.%${searchTerm}%`
        );
      }
      
      const { data, error, count } = await query.range(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage - 1
      );
      
      if (error) throw error;
      
      // Ensure status is correctly typed
      const typedData = data?.map(report => ({
        ...report,
        status: report.status as "new" | "in_progress" | "resolved"
      })) as BugReportRow[];
      
      setBugReports(typedData || []);
      
      // Get total count for pagination
      const { count: totalCount, error: countError } = await supabase
        .from('bug_reports')
        .select('*', { count: 'exact', head: true });
        
      if (countError) throw countError;
      
      setTotalPages(Math.ceil((totalCount || 0) / itemsPerPage));
      
      // Fetch user emails for the bug reports
      if (data && data.length > 0) {
        const userIds = data.filter(report => report.user_id).map(report => report.user_id);
        if (userIds.length > 0) {
          await fetchUserEmails(userIds as string[]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching bug reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bug reports. ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user emails for the bug reports
  const fetchUserEmails = async (userIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, user_email')
        .in('user_id', userIds);
        
      if (error) throw error;
      
      const emailMap: Record<string, string> = {};
      data?.forEach(item => {
        if (item.user_id && item.user_email) {
          emailMap[item.user_id] = item.user_email;
        }
      });
      
      setUserEmails(emailMap);
    } catch (error) {
      console.error('Error fetching user emails:', error);
    }
  };

  // Update bug report status
  const updateBugReportStatus = async (reportId: string, newStatus: 'new' | 'in_progress' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('bug_reports')
        .update({ status: newStatus })
        .eq('id', reportId);
        
      if (error) throw error;
      
      toast({
        title: 'Status Updated',
        description: `Bug report status updated to ${newStatus}`,
      });
      
      // Update local state
      setBugReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
      
      // Send notification on status change
      try {
        const response = await supabase.functions.invoke('send-bug-report-notification', {
          body: { reportId }
        });
        
        if (response.error) {
          console.error('Error sending notification:', response.error);
        }
      } catch (notifyError) {
        console.error('Failed to send status change notification:', notifyError);
      }
      
      // If we're in detail view, update the selected report
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({
          ...selectedReport,
          status: newStatus
        });
      }
    } catch (error: any) {
      console.error('Error updating bug report status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status. ' + error.message,
        variant: 'destructive',
      });
    }
  };

  // Copy user email to clipboard
  const copyEmailToClipboard = (email: string) => {
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

  // Open bug report detail view
  const openDetailView = (report: BugReportRow) => {
    setSelectedReport(report);
    setShowDetailView(true);
  };

  // Close bug report detail view
  const closeDetailView = () => {
    setShowDetailView(false);
    setSelectedReport(null);
  };

  // Format date
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy, HH:mm', { locale: fr });
  };

  // Get status badge color
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

  // Check admin access
  useEffect(() => {
    if (!authReady || profileLoading) return;
    
    if (!user) {
      toast({
        title: 'Accès refusé',
        description: 'Vous devez être connecté pour accéder à cette page.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    
    if (profile && !profile.is_admin) {
      toast({
        title: 'Accès refusé',
        description: 'Vous n\'avez pas les droits nécessaires pour accéder à cette page.',
        variant: 'destructive',
      });
      navigate('/home');
      return;
    }
    
    fetchBugReports();
  }, [authReady, user, profile, profileLoading, currentPage, statusFilter, searchTerm]);

  // Apply filters handler
  const handleApplyFilters = (status: string, search: string) => {
    setStatusFilter(status);
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <>
      <SEO 
        title="Gestion des signalements de bugs | PedagoIA" 
        description="Interface d'administration pour la gestion des signalements de bugs."
      />
      
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Gestion des signalements de bugs</h1>
            <Button variant="outline" onClick={() => navigate('/home')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>

          {showDetailView && selectedReport ? (
            <BugReportDetail 
              report={selectedReport} 
              userEmail={selectedReport.user_id ? userEmails[selectedReport.user_id] : 'Anonyme'} 
              onClose={closeDetailView}
              onStatusChange={updateBugReportStatus}
            />
          ) : (
            <Card className="p-6">
              <BugReportFilters onApplyFilters={handleApplyFilters} />
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingIndicator size="lg" />
                </div>
              ) : bugReports.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucun signalement de bug trouvé.</p>
                </div>
              ) : (
                <>
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
                        {bugReports.map((report) => (
                          <TableRow 
                            key={report.id} 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => openDetailView(report)}
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyEmailToClipboard(userEmails[report.user_id]);
                                    }}
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(report.url, '_blank');
                                    }}
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
                                  openDetailView(report);
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
                
                  {totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="gap-1"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Précédent</span>
                          </Button>
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={currentPage === page}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="gap-1"
                          >
                            <span>Suivant</span>
                            <ArrowLeft className="h-4 w-4 rotate-180" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
