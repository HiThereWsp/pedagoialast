
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionStatus } from './types';
import { shouldSendAmbassadorWelcome, sendAmbassadorWelcomeEmail } from './ambassador-welcome';

/**
 * Process ambassador welcome email if needed and ensure Brevo synchronization
 */
export const processAmbassadorWelcome = async (userId: string, email: string): Promise<void> => {
  if (!userId || !email) return;
  
  try {
    const isAmbassador = await checkAmbassadorSubscription(userId, email);
    
    if (isAmbassador) {
      console.log(`Ambassador subscription confirmed for user: ${userId}`);
      
      // First, ensure the contact is added to the Brevo ambassador list
      try {
        console.log(`Adding ambassador to Brevo list: ${email}`);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', userId)
          .single();
          
        const firstName = profileData?.first_name || null;
        
        // Add to Brevo list
        await supabase.functions.invoke('create-brevo-contact', {
          body: {
            email: email,
            contactName: firstName || email.split('@')[0],
            userType: "ambassador",
            source: "ambassador_confirmation"
          }
        });
        console.log(`Successfully added ambassador to Brevo list: ${email}`);
      } catch (brevoErr) {
        console.error("Error adding ambassador to Brevo list:", brevoErr);
        // Continue with welcome email despite Brevo error
      }
      
      // Then check if we need to send a welcome email
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

/**
 * Check if a user has ambassador status in user_subscriptions
 */
export const checkAmbassadorSubscription = async (userId: string, email: string): Promise<boolean> => {
  try {
    console.log(`Checking ambassador subscription for user: ${userId}, email: ${email}`);
    
    // Special handling for known ambassadors
    const specialAmbassadors = [
      'maitreclementtiktok@gmail.com'
    ];
    
    if (specialAmbassadors.includes(email)) {
      console.log(`Special ambassador detected: ${email}`);
      return true;
    }
    
    // First check user_subscriptions table
    const { data: userSub } = await supabase
      .from('user_subscriptions')
      .select('type')
      .eq('user_id', userId)
      .eq('type', 'ambassador')
      .eq('status', 'active')
      .single();
      
    if (userSub) {
      return true;
    }
    
    // Then check ambassador_program table
    const { data: ambassador } = await supabase
      .from('ambassador_program')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
      
    return !!ambassador;
  } catch (err) {
    console.error("Error checking ambassador subscription:", err);
    return false;
  }
};
