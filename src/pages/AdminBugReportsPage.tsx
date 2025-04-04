
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { BugReportDetail } from '@/components/bug-report/BugReportDetail';
import { BugReportFilters } from '@/components/bug-report/BugReportFilters';
import { BugReportTable } from '@/components/bug-report/BugReportTable';
import { BugReportPagination } from '@/components/bug-report/BugReportPagination';
import { useBugReports } from '@/hooks/bug-report/useBugReports';
import type { BugReportRow } from '@/types/database/tables';

export default function AdminBugReportsPage() {
  const [selectedReport, setSelectedReport] = useState<BugReportRow | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  
  const {
    bugReports,
    loading,
    userEmails,
    totalPages,
    currentPage,
    setCurrentPage,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    updateBugReportStatus,
    fetchBugReports
  } = useBugReports();

  const { user, authReady } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  // Apply filters handler
  const handleApplyFilters = (status: string, search: string) => {
    setStatusFilter(status);
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle status change
  const handleStatusChange = async (reportId: string, newStatus: 'new' | 'in_progress' | 'resolved') => {
    await updateBugReportStatus(reportId, newStatus);
    // If we're in detail view and the current report is updated, refresh the selected report
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({
        ...selectedReport,
        status: newStatus
      });
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
  }, [authReady, user, profile, profileLoading, navigate, toast]);

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
              onStatusChange={handleStatusChange}
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
                  <BugReportTable 
                    reports={bugReports}
                    userEmails={userEmails}
                    onViewDetails={openDetailView}
                  />
                  
                  <BugReportPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
