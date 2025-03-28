// hooks/useUserProfile.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
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
  // These properties might be calculated or added client-side if needed
  admin_expiry: string | null;
  beta_expiry: string | null;
  ambassador_expiry: string | null;
}

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserProfile = async (userEmail: string) => {
    try {
      console.log(`Fetching profile for email: ${userEmail}`);
      const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_email", userEmail)
          .single();

      if (error) {
        console.error("Fetch profile error:", error);
        throw error;
      }
      console.log("User profile:", data);
      
      // Transform the database result to match our UserProfile interface
      const profileData: UserProfile = {
        ...data,
        // Set these values based on role_expiry or with null as default
        admin_expiry: data.is_admin ? data.role_expiry : null,
        beta_expiry: data.is_beta ? data.role_expiry : null,
        ambassador_expiry: data.is_ambassador ? data.role_expiry : null
      };
      
      return profileData;
    } catch (error) {
      console.error("Exception fetching user profile:", error);
      return null;
    }
  };

  const createUserProfile = async (user: User) => {
    try {
      console.log(`Creating profile for user: ${user.email}, UID: ${user.id}`);
      const defaultProfile = {
        user_id: user.id,
        user_email: user.email,
        welcome_email_sent: false,
        email_verified: user.email_confirmed_at ? true : false,
        is_ambassador: false,
        is_beta: false,
        is_admin: false,
        is_paid_user: false,
      };
      const { data, error } = await supabase
          .from("user_profiles")
          .insert(defaultProfile)
          .select()
          .single();

      if (error) {
        console.error("Create profile error:", error);
        throw error;
      }
      console.log("Profile created:", data);
      
      // Transform the database result to match our UserProfile interface
      const profileData: UserProfile = {
        ...data,
        // Set these expiry fields to null for new profiles
        admin_expiry: null,
        beta_expiry: null,
        ambassador_expiry: null
      };
      
      return profileData;
    } catch (error) {
      console.error("Error creating user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user || !user.email) {
        setProfile(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let userProfile = await fetchUserProfile(user.email);
        if (!userProfile) {
          console.log("No profile found, creating one...");
          userProfile = await createUserProfile(user);
          if (!userProfile) {
            throw new Error("Failed to create user profile");
          }
        }
        setProfile(userProfile);
      } catch (err) {
        console.error("Error loading user profile:", err);
        setError("Impossible de charger votre profil. Veuillez réessayer ou contacter le support.");
        toast({
          title: "Erreur de profil",
          description: "Impossible de charger votre profil. Veuillez réessayer ou contacter le support.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, toast]);

  return { profile, loading, error };
};
