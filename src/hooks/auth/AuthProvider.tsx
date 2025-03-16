
import React from "react";
import { AuthContext, AuthContextType } from "./useAuth";
import { useAuthState } from "./useAuthState";
import { useAuthSession } from "./useAuthSession";
import { AuthLoading } from "./AuthLoading";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const {
    user,
    setUser,
    loading,
    setLoading,
    authReady,
    setAuthReady,
    authCheckCompleted
  } = useAuthState();

  // Set up authentication session and listeners
  useAuthSession({
    setUser,
    setLoading,
    setAuthReady,
    authCheckCompleted
  });

  // Handle loading states
  const loadingComponent = (
    <AuthLoading loading={loading} authReady={authReady} user={user}>
      {children}
    </AuthLoading>
  );
  
  if (loadingComponent) {
    return loadingComponent;
  }

  const contextValue: AuthContextType = {
    user,
    loading,
    authReady
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
