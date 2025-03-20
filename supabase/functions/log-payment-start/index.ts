
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from '../_shared/cors.ts';

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
    );

    // Parse the request body
    const reqBody = await req.json();
    const { planType, userId, email } = reqBody;

    console.log(`Logging payment start: ${planType} for user ${userId} (${email})`);

    if (!userId || !planType) {
      console.error('Missing required fields in request');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log the payment start event in user_events
    try {
      const { error: insertError } = await supabaseClient
        .from('user_events')
        .insert({
          user_id: userId,
          event_type: 'payment_start',
          metadata: {
            plan_type: planType,
            timestamp: new Date().toISOString(),
            user_email: email
          }
        });

      if (insertError) {
        console.error('Error logging payment start:', insertError);
        // Continue despite error to not block payment flow
      } else {
        console.log('Successfully logged payment start event');
      }
    } catch (dbError) {
      console.error('Database error logging payment start:', dbError);
      // Continue despite error
    }

    // Try to update the user in Brevo CRM
    try {
      if (email) {
        await supabaseClient.functions.invoke('create-brevo-contact', {
          body: {
            email: email,
            userType: "payment_initiated",
            source: "payment_initiated",
            additionalData: {
              paymentInitiated: true,
              planType: planType
            }
          }
        });
        console.log('Updated user in Brevo CRM for payment initiation');
      }
    } catch (brevoError) {
      console.error('Error updating Brevo:', brevoError);
      // Continue despite Brevo error
    }

    // Return success
    return new Response(
      JSON.stringify({ success: true, message: 'Payment start logged successfully' }),
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
