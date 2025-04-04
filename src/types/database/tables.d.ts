
// Add this at the appropriate location in your existing types file

export interface UserProfileRow {
  id: number;
  created_at: string;
  user_id: string;
  welcome_email_sent: boolean;
  user_email: string;
  email_verified: boolean;
  is_ambassador: boolean;
  is_beta: boolean;
  is_admin: boolean;
  is_paid_user: boolean;
  role_expiry: string | null;
  stripe_customer_id: string | null;
  onboarding_completed: boolean;
  onboarding_tasks: boolean[];
}
