
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { 
  getStripeClient, 
  getSupabaseClient, 
  verifyStripeSignature, 
  handleError 
} from './utils.ts';
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleCheckoutCompleted
} from './subscriptionHandlers.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Stripe webhook endpoint called with method:", req.method);
    console.log("Headers received:", JSON.stringify([...req.headers.entries()]));
    
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error("No Stripe signature found in request headers");
      return new Response(JSON.stringify({ error: 'No Stripe signature found' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const body = await req.text();
    
    if (!body) {
      console.error("Empty request body received");
      return new Response(JSON.stringify({ error: 'Empty request body' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Webhook request received with signature: ${signature.substring(0, 10)}...`);
    console.log(`Request body (first 100 chars): ${body.substring(0, 100)}...`);
    
    // For debugging in production, log the full request body
    // This helps identify issues with webhook data format
    // WARNING: This could log sensitive data, remove in production after debugging
    console.log(`Full request body: ${body}`);
    
    // Verify the signature to ensure it's from Stripe
    let event;
    let skipSignatureVerification = false;
    
    try {
      // Due to potential Stripe signature verification issues in production,
      // consider implementing a fallback for debugging purposes only
      try {
        event = verifyStripeSignature(body, signature);
        console.log(`Event successfully verified: ${event.id}, type: ${event.type}`);
      } catch (signatureError) {
        console.error(`Webhook signature verification failed: ${signatureError.message}`);
        
        // For debugging in production, we might temporarily parse the event without verification
        // This is NOT recommended for production, but can help diagnose issues
        if (Deno.env.get('ENVIRONMENT') === 'development') {
          console.log('Development environment detected, proceeding with unverified event');
          event = JSON.parse(body);
          skipSignatureVerification = true;
        } else {
          throw signatureError; // Re-throw the error for production
        }
      }
      
      // Log if this is a test event
      if (event.livemode === false) {
        console.log('⚠️ This is a TEST event from Stripe');
      } else {
        console.log('✅ This is a LIVE event from Stripe');
      }
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Log detailed event information for debugging
    console.log(`Stripe event received: ${event.type}`);
    
    if (event.data && event.data.object) {
      const object = event.data.object;
      if (object.customer) {
        console.log(`Customer ID: ${object.customer}`);
      }
      if (object.status) {
        console.log(`Status: ${object.status}`);
      }
      if (object.subscription) {
        console.log(`Subscription ID: ${object.subscription}`);
      }
      // Log metadata if exists
      if (object.metadata) {
        console.log(`Metadata: ${JSON.stringify(object.metadata)}`);
      }
    }
    
    // Initialize clients
    const stripe = getStripeClient();
    const supabase = getSupabaseClient();
    
    // Process different event types
    switch (event.type) {
      case 'customer.subscription.created':
        console.log("Processing subscription created event");
        await handleSubscriptionCreated(event.data.object, stripe);
        break;
      case 'customer.subscription.updated':
        console.log("Processing subscription updated event");
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        console.log("Processing subscription deleted event");
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'checkout.session.completed':
        console.log("Processing checkout completed event");
        await handleCheckoutCompleted(event.data.object, stripe);
        break;
      default:
        console.log(`Unhandled event type: ${event.type} - acknowledging but not processing`);
    }
    
    // Always return a 200 response to Stripe to acknowledge receipt
    console.log(`Successfully processed ${event.type} event`);
    return new Response(JSON.stringify({ received: true, event: event.type }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(`Unhandled general error: ${err.message}`);
    console.error(err.stack);
    // Even for errors, we should return a 200 status to prevent Stripe from retrying
    // but log the error for debugging
    return new Response(JSON.stringify({ received: true, error: err.message }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
