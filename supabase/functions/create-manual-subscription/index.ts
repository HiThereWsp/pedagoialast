
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from '../_shared/cors.ts';

// Types for our subscription
interface ManualSubscriptionRequest {
  email: string;
  planType: 'monthly' | 'yearly';
  adminToken: string; // Security token to prevent unauthorized access
}

// The actual serve function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Parse request
    const { email, planType, adminToken }: ManualSubscriptionRequest = await req.json();

    // Validate admin token (this is a simple security measure)
    const validToken = Deno.env.get('ADMIN_RECOVERY_TOKEN');
    if (!validToken || adminToken !== validToken) {
      console.error('Invalid admin token provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Manual subscription creation request for ${email}, plan: ${planType}`);

    if (!email || !planType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the user by email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers({
      filters: {
        email: email
      }
    });

    if (userError) {
      console.error('Error finding user:', userError);
      return new Response(
        JSON.stringify({ error: 'Error finding user', details: userError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userData || userData.users.length === 0) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.users[0].id;
    console.log(`Found user ID: ${userId}`);

    // Calculate expiry date based on subscription type
    const now = new Date();
    let expiryDate = new Date();
    if (planType === 'yearly') {
      expiryDate.setFullYear(now.getFullYear() + 1); // 1 year from now
    } else { // monthly
      expiryDate.setMonth(now.getMonth() + 1); // 1 month from now
    }

    // Check if user already has a subscription
    const { data: existingSub, error: subFetchError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id, status, type')
      .eq('user_id', userId)
      .in('type', ['paid', 'trial'])
      .maybeSingle();

    if (subFetchError) {
      console.error('Error checking existing subscription:', subFetchError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: subFetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    if (existingSub) {
      // Update existing subscription
      console.log(`Updating existing subscription ID: ${existingSub.id}`);
      const { data, error: updateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          status: 'active',
          type: 'paid',
          plan_variant: planType,
          expires_at: expiryDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSub.id)
        .select();

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return new Response(
          JSON.stringify({ error: 'Error updating subscription', details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      result = data;
    } else {
      // Create new subscription
      console.log(`Creating new subscription for user: ${userId}`);
      const { data, error: insertError } = await supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          type: 'paid',
          status: 'active',
          plan_variant: planType,
          expires_at: expiryDate.toISOString()
        })
        .select();

      if (insertError) {
        console.error('Error creating subscription:', insertError);
        return new Response(
          JSON.stringify({ error: 'Error creating subscription', details: insertError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      result = data;
    }

    // Log this action in user_events for audit trail
    await supabaseAdmin
      .from('user_events')
      .insert({
        user_id: userId,
        event_type: 'manual_subscription_created',
        metadata: {
          plan_type: planType,
          email: email,
          timestamp: new Date().toISOString(),
          expires_at: expiryDate.toISOString()
        }
      });

    console.log(`Successfully created/updated subscription for user: ${userId}`);

    // Try to update the user in Brevo CRM
    try {
      await supabaseAdmin.functions.invoke('create-brevo-contact', {
        body: {
          email: email,
          userType: "premium",
          source: "manual_subscription",
          additionalData: {
            subscriptionStatus: 'active',
            planType: planType
          }
        }
      });
      console.log('Updated user in Brevo CRM');
    } catch (brevoError) {
      console.error('Error updating Brevo:', brevoError);
      // Continue despite Brevo error
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Subscription created successfully', data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
