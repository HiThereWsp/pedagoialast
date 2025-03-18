
import { SubscriptionStatus, initialStatus } from './types';
import { supabase } from '@/integrations/supabase/client';
import { logSubscriptionError } from './useErrorLogging';
import { cacheSubscriptionStatus } from './useSubscriptionCache';

/**
 * Check special user emails for immediate access
 * @returns {Promise<SubscriptionStatus | null>} Special status or null
 */
export const checkSpecialEmails = async (): Promise<SubscriptionStatus | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    const email = data.session?.user?.email;
    
    if (!email) return null;
    
    // Beta email list
    const betaEmails = [
      'andyguitteaud@gmail.co', 
      'andyguitteaud@gmail.com',
    ];
    
    if (betaEmails.includes(email)) {
      console.log("Beta email detected, providing immediate access:", email);
      
      const betaStatus = {
        isActive: true,
        type: 'beta',
        expiresAt: null,
        isLoading: false,
        error: null,
        retryCount: 0
      };
      
      return betaStatus;
    }
    
    // Beta domains
    const betaDomains = ['gmail.com', 'pedagogia.fr', 'gmail.fr', 'outlook.fr', 'outlook.com'];
    const emailDomain = email.split('@')[1];
    
    if (betaDomains.includes(emailDomain)) {
      console.log("Beta domain detected, providing immediate access:", emailDomain);
      
      const betaStatus = {
        isActive: true,
        type: 'beta',
        expiresAt: null,
        isLoading: false,
        error: null,
        retryCount: 0
      };
      
      // Send welcome email for new ambassadors if they haven't received one yet
      try {
        console.log(`Checking ambassador status for user: ${data.session?.user?.id}, email: ${email}`);
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('type')
          .eq('user_id', data.session?.user?.id)
          .single();
        
        if (userSub?.type === 'ambassador') {
          console.log(`Ambassador subscription detected for user: ${data.session?.user?.id}`);
          
          // Check if the user has "ambassador_welcome_sent" in metadata
          // If not, trigger the welcome email
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user && (!user.user_metadata?.ambassador_welcome_sent)) {
            console.log(`Ambassador welcome email not sent yet for: ${email}`);
            console.log("Initiating ambassador welcome email...");
            
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('first_name')
                .eq('id', user.id)
                .single();
              
              const firstName = profileData?.first_name || user.user_metadata?.first_name || null;
              console.log(`Sending welcome email to ${email} with firstName: ${firstName || 'null'}`);
              
              const welcomeResponse = await supabase.functions.invoke('send-ambassador-welcome', {
                body: {
                  email: email,
                  firstName: firstName,
                  userId: user.id
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
          } else {
            console.log(`Ambassador welcome email already sent to: ${email}`);
            if (user?.user_metadata?.ambassador_welcome_date) {
              console.log(`Welcome email sent on: ${user.user_metadata.ambassador_welcome_date}`);
            }
          }
        } else {
          console.log(`User ${data.session?.user?.id} is not an ambassador, has type: ${userSub?.type || 'none'}`);
        }
      } catch (err) {
        console.error("Error checking ambassador status:", err);
      }
      
      return betaStatus;
    }
  } catch (err) {
    console.error("Error checking special emails:", err);
  }
  
  return null;
};
