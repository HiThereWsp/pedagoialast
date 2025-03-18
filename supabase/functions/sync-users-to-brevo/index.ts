
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

// Les ID des listes Brevo (correspondant aux définitions existantes)
const BREVO_LISTS = {
  BETA_USERS: 7,      // Liste existante des utilisateurs beta
  FREE_USERS: 8,      // Liste pour les utilisateurs inscrits non payants
  PREMIUM_USERS: 9,   // Liste pour les utilisateurs payants
  AMBASSADORS: 10     // Liste pour les ambassadeurs
};

Deno.serve(async (req) => {
  // Check for environment variables
  const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!BREVO_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing required environment variables");
    return new Response(
      JSON.stringify({ 
        error: "Missing required environment variables" 
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }

  try {
    // Initialize Supabase client with service role for admin privileges
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get optional parameters from request
    const { syncMode = 'all', userId = null, limit = 100, offset = 0 } = await req.json();
    
    console.log(`Starting synchronization in mode: ${syncMode}, userId: ${userId}, limit: ${limit}, offset: ${offset}`);
    
    let usersToSync = [];
    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;
    
    // Get users based on the sync mode
    if (syncMode === 'user' && userId) {
      // Synchronize a specific user
      const { data: user, error } = await supabase.auth.admin.getUserById(userId);
      
      if (error) {
        console.error("Error fetching user:", error);
        return new Response(
          JSON.stringify({ error: `Error fetching user: ${error.message}` }),
          { 
            status: 400, 
            headers: { "Content-Type": "application/json", ...corsHeaders } 
          }
        );
      }
      
      if (user) {
        usersToSync = [user.user];
      }
    } else {
      // Get all users with pagination
      const { data: users, error } = await supabase.auth.admin.listUsers({
        page: Math.floor(offset / limit) + 1,
        perPage: limit
      });
      
      if (error) {
        console.error("Error fetching users:", error);
        return new Response(
          JSON.stringify({ error: `Error fetching users: ${error.message}` }),
          { 
            status: 500, 
            headers: { "Content-Type": "application/json", ...corsHeaders } 
          }
        );
      }
      
      usersToSync = users.users;
    }
    
    console.log(`Found ${usersToSync.length} users to process`);
    
    // Process each user
    for (const user of usersToSync) {
      try {
        if (!user.email) {
          console.log(`User ${user.id} has no email, skipping`);
          skippedCount++;
          continue;
        }
        
        // Get user's profile data for first name
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();
        
        const firstName = profileData?.first_name || user.user_metadata?.first_name || user.email.split('@')[0];
        
        // Determine user type based on subscriptions
        const { data: subscriptions } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('type', { ascending: false }); // Prioritize paid > trial > beta > ambassador
        
        let userType = 'free'; // Default type
        let listIds = [BREVO_LISTS.FREE_USERS]; // Default list
        
        // Check for ambassador status first (in ambassador_program table)
        const { data: ambassadorData } = await supabase
          .from('ambassador_program')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();
        
        if (ambassadorData) {
          userType = 'ambassador';
          listIds = [BREVO_LISTS.AMBASSADORS];
        } 
        // Then check subscriptions in priority order
        else if (subscriptions && subscriptions.length > 0) {
          // Find subscription with highest priority (paid > trial > beta > ambassador)
          const priorityOrder = ['paid', 'trial', 'beta', 'ambassador'];
          
          // Sort subscriptions by priority
          subscriptions.sort((a, b) => {
            return priorityOrder.indexOf(a.type) - priorityOrder.indexOf(b.type);
          });
          
          const highestPrioritySubscription = subscriptions[0];
          
          switch (highestPrioritySubscription.type) {
            case 'paid':
              userType = 'premium';
              listIds = [BREVO_LISTS.PREMIUM_USERS];
              break;
            case 'trial':
              userType = 'premium'; // Trials go to premium list as well
              listIds = [BREVO_LISTS.PREMIUM_USERS];
              break;
            case 'beta':
              userType = 'beta';
              listIds = [BREVO_LISTS.BETA_USERS];
              break;
            case 'ambassador':
              userType = 'ambassador';
              listIds = [BREVO_LISTS.AMBASSADORS];
              break;
            default:
              userType = 'free';
              listIds = [BREVO_LISTS.FREE_USERS];
          }
        }
        
        console.log(`Syncing user ${user.email} to Brevo as ${userType}`);
        
        // Create/update contact in Brevo
        const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": BREVO_API_KEY,
          },
          body: JSON.stringify({
            email: user.email,
            attributes: {
              PRENOM: firstName,
              EMAIL: user.email,
              SOURCE: "sync-script",
              TYPE_UTILISATEUR: userType,
              UUID: user.id
            },
            listIds: listIds,
            updateEnabled: true // Update if already exists
          }),
        });
        
        if (brevoResponse.ok) {
          console.log(`Successfully synced ${user.email} to Brevo as ${userType}`);
          successCount++;
        } else {
          const errorText = await brevoResponse.text();
          console.error(`Error syncing ${user.email} to Brevo:`, errorText);
          failureCount++;
        }
      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError);
        failureCount++;
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Synchronization completed`,
        stats: {
          processed: usersToSync.length,
          success: successCount,
          failures: failureCount,
          skipped: skippedCount
        }
      }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("General error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
