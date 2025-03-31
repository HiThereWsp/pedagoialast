
import { User } from '@supabase/supabase-js';

export interface BugReport {
  id?: string;
  user_id?: string;
  description: string;
  screenshot_url?: string;
  browser_info?: string;
  url?: string;
  status?: 'new' | 'in_progress' | 'resolved';
  created_at?: string;
}

export interface UseBugReportState {
  description: string;
  screenshot: string | File | null;
  isCapturing: boolean;
  isUploading: boolean;
  isSubmitting: boolean;
  submissionError?: string | null;
}

export interface UseBugReportActions {
  setDescription: (description: string) => void;
  captureScreenshot: () => Promise<void>;
  uploadScreenshot: () => void;
  submitReport: () => Promise<any>;
  resetForm: () => void;
}

export type UseBugReportReturn = UseBugReportState & UseBugReportActions;
