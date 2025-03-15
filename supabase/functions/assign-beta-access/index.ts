
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }

  try {
    // Parse request
    const { userEmail, adminToken } = await req.json()

    // Verify admin token for security (this should be a proper auth check in production)
    if (!adminToken || adminToken !== Deno.env.get('ADMIN_SECRET_KEY')) {
      console.error('Unauthorized access attempt');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Non autorisé' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    // Validate email
    if (!userEmail) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Email utilisateur requis' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Initialize Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Look up user by email
    const { data: users, error: userError } = await supabaseAdmin
      .from('auth.users')
      .select('id')
      .eq('email', userEmail)
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.error('User lookup error:', userError || 'User not found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Utilisateur non trouvé' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }

    const userId = users[0].id;
    const betaExpiryDate = '2025-08-28 23:59:59+00';

    // Check if user already has a subscription
    const { data: existingSub, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id, type, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    // Log the action for audit purposes
    await supabaseAdmin
      .from('admin_actions')
      .insert({
        action_type: 'assign_beta_access',
        admin_id: 'system', // This should be the actual admin ID in a real implementation
        target_user_id: userId,
        details: { 
          user_email: userEmail,
          expires_at: betaExpiryDate,
          previous_subscription: existingSub || null
        }
      })
      .select();

    // If user already has an active subscription
    if (existingSub && existingSub.length > 0) {
      // If it's already a beta subscription, just update the expiry date
      if (existingSub[0].type === 'beta') {
        const { data, error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({ 
            expires_at: betaExpiryDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSub[0].id)
          .select();
          
        if (error) {
          console.error('Error updating subscription:', error);
          throw error;
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Accès beta prolongé jusqu\'au 28 août 2025',
            subscription: data
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      } 
      
      // If it's a different subscription type, deactivate it and create a new beta one
      const { error: deactivateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSub[0].id);
        
      if (deactivateError) {
        console.error('Error deactivating existing subscription:', deactivateError);
        throw deactivateError;
      }
    }
    
    // Create new beta subscription
    const { data: newSub, error: createError } = await supabaseAdmin
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        type: 'beta',
        status: 'active',
        expires_at: betaExpiryDate
      })
      .select();
      
    if (createError) {
      console.error('Error creating beta subscription:', createError);
      throw createError;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Accès beta accordé jusqu\'au 28 août 2025',
        subscription: newSub
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error in assign-beta-access:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Erreur lors de l\'attribution de l\'accès beta',
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
