
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from '../_shared/cors.ts';
import { RECOVERY_TOKEN_NAME } from '../_shared/recovery-tokens.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Parse the request body
    const { email, planType, adminToken } = await req.json();

    // Validate inputs
    if (!email || !planType || !adminToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify admin token
    const recoveryTokenName = Deno.env.get(RECOVERY_TOKEN_NAME);
    if (!recoveryTokenName || adminToken !== recoveryTokenName) {
      console.error('Invalid admin token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Find user by email
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('id, user_id')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Error finding user:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found', details: userError }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userId = userData.user_id || userData.id;

    // Check if user already has a subscription
    const { data: existingSubscription, error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (subscriptionError) {
      console.error('Error checking existing subscription:', subscriptionError);
    }

    if (existingSubscription) {
      console.log('User already has a subscription:', existingSubscription);
      
      // Update the existing subscription
      const { data: updateData, error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({
          status: 'active',
          plan_type: planType,
          current_period_end: new Date(Date.now() + (planType === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false,
          manual_repair: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select();

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update subscription', details: updateError }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subscription repaired successfully', 
          data: updateData, 
          action: 'updated' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create a new subscription
    const { data: newSubscription, error: createError } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: userId,
        status: 'active',
        plan_type: planType,
        current_period_end: new Date(Date.now() + (planType === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        manual_repair: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (createError) {
      console.error('Error creating subscription:', createError);
      return new Response(
        JSON.stringify({ error: 'Failed to create subscription', details: createError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log the repair event
    try {
      await supabaseClient
        .from('user_events')
        .insert({
          user_id: userId,
          event_type: 'subscription_repaired',
          metadata: {
            plan_type: planType,
            admin_initiated: true,
            timestamp: new Date().toISOString()
          }
        });
    } catch (logError) {
      console.error('Error logging repair event:', logError);
      // Continue despite logging error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Subscription created successfully', 
        data: newSubscription, 
        action: 'created' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unhandled error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
