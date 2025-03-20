
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Verify a user's email if it's not already verified
 * This can help when users have payment problems due to unverified emails
 */
export async function verifyUserEmail(supabase, email) {
  if (!email) {
    console.log('No email provided for verification');
    return false;
  }
  
  try {
    // Check if user exists and if their email is already verified
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
      filter: {
        email: email
      }
    });
    
    if (usersError) {
      console.error('Error fetching user for verification:', usersError);
      return false;
    }
    
    if (!users || users.length === 0) {
      console.log(`No user found with email ${email} for verification`);
      return false;
    }
    
    const user = users[0];
    
    // If email is already confirmed, no need to do anything
    if (user.email_confirmed_at) {
      console.log(`Email ${email} is already verified at ${user.email_confirmed_at}`);
      return true;
    }
    
    // Force email verification
    console.log(`Setting email ${email} as verified`);
    
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );
    
    if (updateError) {
      console.error(`Error verifying email: ${updateError.message}`);
      return false;
    }
    
    console.log(`Successfully verified email for ${email}`);
    return true;
    
  } catch (error) {
    console.error(`Error in verifyUserEmail: ${error.message}`);
    return false;
  }
}

/**
 * Ensure user's profile exists and update it if needed
 */
export async function ensureUserProfile(supabase, userId, email, customerData = {}) {
  if (!userId) {
    console.error('No user ID provided for profile check');
    return false;
  }
  
  try {
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error(`Error checking profile: ${profileError.message}`);
    }
    
    // If profile exists, update it if needed
    if (profile) {
      // Only update if we have new data to add
      const updateData = {};
      let needsUpdate = false;
      
      if (email && (!profile.email || profile.email !== email)) {
        updateData.email = email;
        needsUpdate = true;
      }
      
      if (customerData.stripe_customer_id && !profile.stripe_customer_id) {
        updateData.stripe_customer_id = customerData.stripe_customer_id;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);
          
        if (updateError) {
          console.error(`Error updating profile: ${updateError.message}`);
          return false;
        }
        
        console.log(`Updated profile for user ${userId}`);
      } else {
        console.log(`Profile for user ${userId} already up to date`);
      }
      
      return true;
    }
    
    // If profile doesn't exist, create it
    console.log(`Creating new profile for user ${userId}`);
    
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        first_name: 'User', // Default value
        ...customerData
      });
      
    if (insertError) {
      console.error(`Error creating profile: ${insertError.message}`);
      return false;
    }
    
    console.log(`Successfully created profile for user ${userId}`);
    return true;
    
  } catch (error) {
    console.error(`Error in ensureUserProfile: ${error.message}`);
    return false;
  }
}
