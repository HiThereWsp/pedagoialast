
import { supabase } from '@/integrations/supabase/client';

/**
 * Send a welcome email to an ambassador via the ambassador welcome edge function
 */
export const sendAmbassadorWelcomeEmail = async (
  email: string, 
  userId: string,
  firstName: string | null = null
): Promise<void> => {
  console.log(`Sending welcome email to ambassador: ${email}, userId: ${userId}`);
  
  try {
    // First, add the contact to the Brevo ambassador list
    try {
      await supabase.functions.invoke('create-brevo-contact', {
        body: {
          email: email,
          contactName: firstName || email.split('@')[0],
          userType: "ambassador",
          source: "ambassador_welcome"
        }
      });
      console.log(`Contact successfully added to Brevo ambassador list: ${email}`);
    } catch (brevoErr) {
      console.error("Failed to add contact to Brevo ambassador list:", brevoErr);
      // Continue with welcome email despite Brevo error
    }
    
    // Then send the welcome email
    const welcomeResponse = await supabase.functions.invoke('send-ambassador-welcome', {
      body: {
        email: email,
        firstName: firstName,
        userId: userId
      }
    });
    
    console.log("Ambassador welcome email function response:", welcomeResponse);
    
    if (welcomeResponse.error) {
      console.error("Failed to send ambassador welcome email:", welcomeResponse.error);
    } else {
      // Update user metadata to mark welcome email as sent
      const updateResponse = await supabase.auth.updateUser({
        data: {
          ambassador_welcome_sent: true,
          ambassador_welcome_date: new Date().toISOString()
        }
      });
      
      if (updateResponse.error) {
        console.error("Failed to update user metadata:", updateResponse.error);
      } else {
        console.log("Ambassador welcome email sent and user metadata updated");
      }
    }
  } catch (err) {
    console.error("Exception during ambassador welcome email process:", err);
  }
};

/**
 * Check if an ambassador welcome email should be sent based on user metadata
 */
export const shouldSendAmbassadorWelcome = async (userId: string, email: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("No user found, cannot check ambassador welcome status");
      return false;
    }
    
    const welcomeAlreadySent = user.user_metadata?.ambassador_welcome_sent;
    
    if (welcomeAlreadySent) {
      console.log(`Ambassador welcome email already sent to: ${email}`);
      if (user.user_metadata?.ambassador_welcome_date) {
        console.log(`Welcome email sent on: ${user.user_metadata.ambassador_welcome_date}`);
      }
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error checking ambassador welcome email status:", err);
    return false;
  }
};
