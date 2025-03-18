
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionStatus } from './types';
import { shouldSendAmbassadorWelcome, sendAmbassadorWelcomeEmail } from './ambassador-welcome';

/**
 * Check if a user has ambassador status in user_subscriptions
 */
export const checkAmbassadorSubscription = async (userId: string, email: string): Promise<boolean> => {
  try {
    console.log(`Checking ambassador subscription for user: ${userId}, email: ${email}`);
    const { data: userSub } = await supabase
      .from('user_subscriptions')
      .select('type')
      .eq('user_id', userId)
      .single();
    
    return userSub?.type === 'ambassador';
  } catch (err) {
    console.error("Error checking ambassador subscription:", err);
    return false;
  }
};

/**
 * Process ambassador welcome email if needed
 */
export const processAmbassadorWelcome = async (userId: string, email: string): Promise<void> => {
  if (!userId || !email) return;
  
  try {
    const isAmbassador = await checkAmbassadorSubscription(userId, email);
    
    if (isAmbassador) {
      console.log(`Ambassador subscription confirmed for user: ${userId}`);
      
      const shouldSendEmail = await shouldSendAmbassadorWelcome(userId, email);
      
      if (shouldSendEmail) {
        console.log(`Ambassador welcome email needs to be sent to: ${email}`);
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', userId)
          .single();
        
        const { data: { user } } = await supabase.auth.getUser();
        const firstName = profileData?.first_name || user?.user_metadata?.first_name || null;
        
        console.log(`Sending welcome email to ${email} with firstName: ${firstName || 'null'}`);
        await sendAmbassadorWelcomeEmail(email, userId, firstName);
      }
    } else {
      console.log(`User ${userId} is not an ambassador`);
    }
  } catch (err) {
    console.error("Error processing ambassador welcome:", err);
  }
};
