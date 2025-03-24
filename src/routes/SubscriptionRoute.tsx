
import React from "react";
import { SubscriptionLoading } from "@/components/subscription/SubscriptionLoading";
import { SubscriptionError } from "@/components/subscription/SubscriptionError";
import { LimitedAccessCard } from "@/components/subscription/LimitedAccessCard";
import { useSubscriptionRouteLogic } from "@/hooks/subscription/useSubscriptionRouteLogic";
import {useAuth} from "@/hooks";

interface SubscriptionRouteProps {
  children: JSX.Element;
}

export const SubscriptionRoute = ({ children }: SubscriptionRouteProps) => {
  const {
    isSubscribed,
    isLoading,
    isChecking,
    error,
    showContent,
    isRetrying,
    handleRetry,
    user
  } = useSubscriptionRouteLogic();
  
  // Rendering logic based on conditions
  
  // If special access is granted, show content immediately
  // show content

  if (showContent) {
    console.log("ShowContent Condition",{showContent});
    return children;
  }
  
  // Only show loading during unusually long verifications and not in dev mode
  if (isLoading && isChecking && !import.meta.env.DEV) {
    return <SubscriptionLoading />;
  }
  
  // If an error occurred, display an error message with retry option
  if (error) {
    console.error('Subscription verification error:', error);
    
    // In development mode, allow access despite error
    if (import.meta.env.DEV) {
      console.log('Development mode detected, access granted despite error');
      return children;
    }
    
    return (
      <SubscriptionError 
        error={error} 
        isRetrying={isRetrying} 
        onRetry={handleRetry} 
      />
    );
  }
  
  // If no active subscription, show subscription required message
  // if (!isSubscribed) {
  //   return <LimitedAccessCard />;
  // }
  
  // User has a valid subscription, show content
  return <LimitedAccessCard />;
};
