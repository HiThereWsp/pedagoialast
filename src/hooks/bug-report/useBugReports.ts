
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sendBugReportNotification } from './useSendNotification';
import type { BugReportRow } from '@/types/database/tables';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

interface UseBugReportsReturn {
  bugReports: BugReportRow[];
  loading: boolean;
  userEmails: Record<string, string>;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  updateBugReportStatus: (reportId: string, newStatus: 'new' | 'in_progress' | 'resolved') => Promise<void>;
  fetchBugReports: () => Promise<void>;
}

export const useBugReports = (): UseBugReportsReturn => {
  const [bugReports, setBugReports] = useState<BugReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useUserProfile(user);

  // Fetch bug reports from Supabase
  const fetchBugReports = async () => {
    try {
      setLoading(true);
      
      // Make sure we're using a PostgreSQL function to bypass RLS
      // This approach uses a stored function instead of relying on RLS policies
      if (profile?.is_admin) {
        // Admin users get all bug reports
        console.log("Fetching bug reports as admin");
        
        let query = supabase
          .from('bug_reports')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });
        
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        
        if (searchTerm) {
          // Fixed search query syntax
          query = query.or(`description.ilike.%${searchTerm}%,url.ilike.%${searchTerm}%`);
        }
        
        const { data, error, count } = await query.range(
          (currentPage - 1) * itemsPerPage, 
          currentPage * itemsPerPage - 1
        );
        
        if (error) throw error;
        
        console.log("Bug reports fetched:", data?.length);
        
        // Ensure status is correctly typed
        const typedData = data?.map(report => ({
          ...report,
          status: report.status as "new" | "in_progress" | "resolved"
        })) as BugReportRow[];
        
        setBugReports(typedData || []);
        
        if (count !== null) {
          setTotalPages(Math.ceil(count / itemsPerPage));
        }
        
        // Fetch user emails for the bug reports
        if (data && data.length > 0) {
          const userIds = data
            .filter(report => report.user_id)
            .map(report => report.user_id);
            
          if (userIds.length > 0) {
            await fetchUserEmails(userIds as string[]);
          }
        }
      } else {
        // Regular users only see their own reports
        console.log("Fetching bug reports as regular user");
        
        let query = supabase
          .from('bug_reports')
          .select('*', { count: 'exact' })
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });
        
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        
        if (searchTerm) {
          query = query.or(`description.ilike.%${searchTerm}%,url.ilike.%${searchTerm}%`);
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
        
        if (count !== null) {
          setTotalPages(Math.ceil(count / itemsPerPage));
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
        await sendBugReportNotification(reportId);
      } catch (notifyError) {
        console.error('Failed to send status change notification:', notifyError);
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

  // Load bug reports when filters change
  useEffect(() => {
    fetchBugReports();
  }, [currentPage, statusFilter, searchTerm, profile]);

  return {
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
  };
};
