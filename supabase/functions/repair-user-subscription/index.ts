
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Get clients
const getSupabaseClient = () => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { userId, email } = await req.json();
    console.log(`Attempting to repair subscription for user ${userId || email}`);
    
    if (!userId && !email) {
      return new Response(
        JSON.stringify({ error: 'Either userId or email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = getSupabaseClient();
    
    // Determine user ID if only email provided
    let targetUserId = userId;
    if (!targetUserId && email) {
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
        filter: {
          email: email
        }
      });
      
      if (usersError) {
        console.error('Error finding user by email:', usersError);
        return new Response(
          JSON.stringify({ error: `Error finding user: ${usersError.message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!users || users.length === 0) {
        return new Response(
          JSON.stringify({ error: `No user found with email: ${email}` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      targetUserId = users[0].id;
      console.log(`Found user ID ${targetUserId} for email ${email}`);
    }
    
    // Step 1: Verify email if not confirmed
    let emailVerified = false;
    if (targetUserId) {
      const { data: { users }, error: userError } = await supabase.auth.admin.listUsers({
        filter: {
          id: targetUserId
        }
      });
      
      if (userError) {
        console.error('Error getting user details:', userError);
      } else if (users && users.length > 0) {
        const user = users[0];
        
        if (!user.email_confirmed_at) {
          console.log(`Email not confirmed for user ${targetUserId}, verifying now...`);
          
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            targetUserId,
            { email_confirm: true }
          );
          
          if (updateError) {
            console.error('Error verifying email:', updateError);
          } else {
            emailVerified = true;
            console.log(`Email verified for user ${targetUserId}`);
          }
        } else {
          emailVerified = true;
          console.log(`Email already verified for user ${targetUserId} at ${user.email_confirmed_at}`);
        }
      }
    }
    
    // Step 2: Check and create/update profile if needed
    let profileFixed = false;
    if (targetUserId) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error checking profile:', profileError);
      } else if (!profileData) {
        console.log(`No profile found for user ${targetUserId}, creating one...`);
        
        // Get user details for the profile
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers({
          filter: {
            id: targetUserId
          }
        });
        
        if (userError) {
          console.error('Error getting user details for profile:', userError);
        } else if (users && users.length > 0) {
          const user = users[0];
          
          // Create profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: targetUserId,
              email: user.email,
              first_name: user.user_metadata?.first_name || 'User',
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            profileFixed = true;
            console.log(`Created profile for user ${targetUserId}`);
          }
        }
      } else {
        profileFixed = true;
        console.log(`Profile already exists for user ${targetUserId}`);
      }
    }
    
    // Step 3: Create or update subscription for special testing
    let subscriptionFixed = false;
    if (targetUserId) {
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (subscriptionError) {
        console.error('Error checking subscription:', subscriptionError);
      } else if (!subscriptionData) {
        console.log(`No active subscription found for user ${targetUserId}, creating one...`);
        
        // Create a trial subscription that expires in 30 days
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        
        const { error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: targetUserId,
            type: 'ambassador', // Use ambassador for testing
            status: 'active',
            current_period_end: expiryDate.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error creating subscription:', insertError);
        } else {
          subscriptionFixed = true;
          console.log(`Created ambassador subscription for user ${targetUserId} expiring at ${expiryDate.toISOString()}`);
        }
      } else {
        // Extend the subscription if it's expiring soon or already expired
        const currentExpiry = new Date(subscriptionData.current_period_end);
        const now = new Date();
        
        if (currentExpiry < now || (currentExpiry.getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000) {
          console.log(`Subscription for user ${targetUserId} is expired or expiring soon, extending it...`);
          
          const newExpiryDate = new Date();
          newExpiryDate.setDate(newExpiryDate.getDate() + 30);
          
          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({
              status: 'active',
              current_period_end: newExpiryDate.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', subscriptionData.id);
          
          if (updateError) {
            console.error('Error extending subscription:', updateError);
          } else {
            subscriptionFixed = true;
            console.log(`Extended subscription for user ${targetUserId} to ${newExpiryDate.toISOString()}`);
          }
        } else {
          subscriptionFixed = true;
          console.log(`Subscription for user ${targetUserId} is active until ${currentExpiry.toISOString()}`);
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'User subscription repaired successfully',
        userId: targetUserId,
        email: email,
        fixes: {
          emailVerified,
          profileFixed,
          subscriptionFixed
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error repairing subscription:', error);
    
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
