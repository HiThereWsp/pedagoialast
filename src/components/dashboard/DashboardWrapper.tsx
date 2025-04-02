
import React from 'react';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { useLocation } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export const DashboardWrapper = ({ children }: DashboardWrapperProps) => {
  const { isSubscribed } = useSubscription();
  const location = useLocation();
  
  // Only show the onboarding checklist on specific routes and for subscribed users
  const shouldShowOnboarding = () => {
    // Don't show on settings, pricing, or admin routes
    const excludedRoutes = ['/settings', '/pricing', '/admin', '/user-management', '/metrics', '/delete-account'];
    const isExcludedRoute = excludedRoutes.some(route => location.pathname.includes(route));
    
    // Only show for subscribed users
    return isSubscribed && !isExcludedRoute;
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {children}
      {shouldShowOnboarding() && <OnboardingChecklist />}
    </div>
  );
};

export default DashboardWrapper;
