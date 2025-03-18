
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const SignupPage = () => {
  const { user } = useAuth();
  
  // Redirect to signup component with correct behavior
  if (user) {
    return <Navigate to="/tableau-de-bord" replace />;
  }
  
  // Redirect to landing page with signup dialog
  return <Navigate to="/?signup=true" replace />;
};

export default SignupPage;
