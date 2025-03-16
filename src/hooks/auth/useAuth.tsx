
import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  authReady: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authReady: false
});

/**
 * Hook to access authentication information throughout the app
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
