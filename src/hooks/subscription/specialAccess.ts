
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
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('type')
          .eq('user_id', data.session?.user?.id)
          .single();
        
        if (userSub?.type === 'ambassador') {
          console.log("Ambassador detected, checking if welcome email needs to be sent");
          
          // Check if the user has "ambassador_welcome_sent" in metadata
          // If not, trigger the welcome email
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user && (!user.user_metadata?.ambassador_welcome_sent)) {
            console.log("Sending ambassador welcome email...");
            
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('first_name')
                .eq('id', user.id)
                .single();
              
              await supabase.functions.invoke('send-ambassador-welcome', {
                body: {
                  email: email,
                  firstName: profileData?.first_name || user.user_metadata?.first_name || null,
                  userId: user.id
                }
              });
              
              // Update user metadata to mark welcome email as sent
              await supabase.auth.updateUser({
                data: {
                  ambassador_welcome_sent: true,
                  ambassador_welcome_date: new Date().toISOString()
                }
              });
              
              console.log("Ambassador welcome email sent and user metadata updated");
            } catch (err) {
              console.error("Failed to send ambassador welcome email:", err);
            }
          }
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
