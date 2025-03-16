
import { useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";

/**
 * Hook to manage authentication state
 */
export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const authCheckCompleted = useRef(false);

  return {
    user,
    setUser,
    loading,
    setLoading,
    authReady,
    setAuthReady,
    authCheckCompleted
  };
}
