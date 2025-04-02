
import React from 'react';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export const DashboardWrapper = ({ children }: DashboardWrapperProps) => {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {children}
      <OnboardingChecklist />
    </div>
  );
};

export default DashboardWrapper;
