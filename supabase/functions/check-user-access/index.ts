
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

  try {
    // Authentification
    const authHeader = req.headers.get('Authorization')!;
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentification requise' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Erreur authentification:', userError);
      return new Response(
        JSON.stringify({ error: 'Utilisateur non authentifié', details: userError }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Vérifier si l'utilisateur est beta testeur
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (roleData?.role === 'beta_tester') {
      return new Response(
        JSON.stringify({ 
          access: true, 
          type: 'beta_tester',
          expires_at: '2025-08-31T23:59:59Z' // Date de fin de la période beta
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Vérifier si abonnement actif
    const { data: subscriptionData, error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .select('status, type, expires_at')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (subscriptionError) {
      console.error('Erreur vérification abonnement:', subscriptionError);
    }
    
    if (subscriptionData?.status === 'active' && 
        new Date(subscriptionData.expires_at) > new Date()) {
      return new Response(
        JSON.stringify({ 
          access: true, 
          type: subscriptionData.type,
          expires_at: subscriptionData.expires_at
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Aucun accès valide trouvé
    return new Response(
      JSON.stringify({ 
        access: false,
        message: "Abonnement requis ou expiré"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Erreur générale:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
