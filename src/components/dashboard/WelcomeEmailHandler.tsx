
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from "@supabase/supabase-js";

interface WelcomeEmailHandlerProps {
  userEmail?: string;
  emailConfirmedAt?: string;
}

export const WelcomeEmailHandler = ({ userEmail, emailConfirmedAt }: WelcomeEmailHandlerProps) => {
  useEffect(() => {
    if (!userEmail || !emailConfirmedAt) return;
    
    const checkWelcomeEmail = async () => {
      try {
        const { data: userProfiles, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_email', userEmail);
          
        console.log({ userProfiles });
        
        if (error) {
          console.error("Erreur lors de la vérification du profil:", error);
          return;
        }
        
        if (userProfiles && !userProfiles[0]?.welcome_email_sent) {
          try {
            console.log("Envoi de l'email de bienvenue...");
            
            const { data: emailData, error: emailError } = await supabase.functions.invoke(
              "send-welcome-emails-after-signup",
              {
                body: {
                  type: "welcome",
                  email: userEmail,
                },
              }
            );
            
            if (emailError) {
              handleEmailError(emailError);
            } else {
              console.log("Email de bienvenue envoyé avec succès");
              
              // Mise à jour du statut dans la base de données
              await supabase
                .from('user_profiles')
                .update({ welcome_email_sent: true })
                .eq('user_email', userEmail);
            }
          } catch (emailErr) {
            console.error("Email sending failed:", emailErr);
          }
        }
      } catch (err) {
        console.error("Erreur lors de la vérification de l'email de bienvenue:", err);
      }
    };
    
    checkWelcomeEmail();
  }, [userEmail, emailConfirmedAt]);
  
  return null;
};

const handleEmailError = (emailError: any) => {
  if (emailError instanceof FunctionsHttpError) {
    console.error("Function error:", emailError.context);
  } else if (emailError instanceof FunctionsRelayError) {
    console.error("Relay error:", emailError.message);
  } else if (emailError instanceof FunctionsFetchError) {
    console.error("Fetch error:", emailError.message);
  } else {
    console.error("Unknown error:", emailError);
  }
};
