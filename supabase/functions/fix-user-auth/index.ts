
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

    // Vérifier le token admin pour sécurité (ceci devrait être une vérification d'auth appropriée en production)
    if (!adminToken || adminToken !== Deno.env.get('ADMIN_SECRET_KEY')) {
      console.error('Tentative d\'accès non autorisée');
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

    // Valider l'email
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

    // Initialiser le client Supabase avec le rôle de service pour contourner RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Vérifier la situation actuelle de l'utilisateur
    const { data: authUsers, error: authUserError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email, identities')
      .eq('email', userEmail)
      .limit(1);

    if (authUserError) {
      console.error('Erreur lors de la recherche de l\'utilisateur:', authUserError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Erreur lors de la vérification des informations utilisateur',
          error: authUserError.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Analyser l'état actuel et les identités
    let diagnosticInfo = {
      userFound: false,
      userIdentities: [],
      hasFacebookIdentity: false,
      hasGoogleIdentity: false,
      hasEmailIdentity: false,
      recommendation: ''
    };

    if (authUsers && authUsers.length > 0) {
      const user = authUsers[0];
      diagnosticInfo.userFound = true;
      
      // Vérifier les identités (providers d'authentification)
      const identities = user.identities || [];
      diagnosticInfo.userIdentities = identities;
      
      identities.forEach((identity: any) => {
        if (identity.provider === 'facebook') diagnosticInfo.hasFacebookIdentity = true;
        if (identity.provider === 'google') diagnosticInfo.hasGoogleIdentity = true;
        if (identity.provider === 'email') diagnosticInfo.hasEmailIdentity = true;
      });

      // Générer une recommandation
      if (diagnosticInfo.hasFacebookIdentity) {
        diagnosticInfo.recommendation = "L'utilisateur devrait essayer de se connecter avec Facebook";
      } else if (diagnosticInfo.hasGoogleIdentity) {
        diagnosticInfo.recommendation = "L'utilisateur devrait essayer de se connecter avec Google";
      } else if (diagnosticInfo.hasEmailIdentity) {
        diagnosticInfo.recommendation = "L'utilisateur devrait essayer de se connecter avec son email";
      } else {
        diagnosticInfo.recommendation = "L'utilisateur existe mais n'a pas d'identité complète. Essayez de lui envoyer un lien magique.";
      }

      // Journaliser l'action à des fins d'audit
      await supabaseAdmin
        .from('admin_actions')
        .insert({
          action_type: 'diagnose_user_auth',
          admin_id: 'system', // Ceci devrait être l'ID admin réel dans une implémentation réelle
          target_user_id: user.id,
          details: diagnosticInfo
        })
        .select();

      return new Response(
        JSON.stringify({
          success: true,
          diagnosticInfo,
          userId: user.id,
          email: user.email,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } else {
      // Utilisateur non trouvé
      diagnosticInfo.recommendation = "L'utilisateur n'existe pas encore. Il devrait s'inscrire normalement.";
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Utilisateur non trouvé",
          diagnosticInfo
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
  } catch (error) {
    console.error('Erreur dans fix-user-auth:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Erreur lors du diagnostic de l\'authentification',
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
