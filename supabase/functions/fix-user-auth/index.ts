
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
    const { userEmail, adminToken } = await req.json()
    
    // Vérifier le token admin pour sécurité
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
      )
    }

    // Initialiser le client Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Rechercher l'utilisateur par email
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError) {
      console.error('Erreur lors de la récupération des utilisateurs:', userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Erreur lors de la récupération des utilisateurs',
          error: userError.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Trouver l'utilisateur correspondant à l'email
    const user = users.find(u => u.email?.toLowerCase() === userEmail.toLowerCase())
    
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          email: userEmail,
          diagnosticInfo: {
            userFound: false,
            recommendation: "Cet utilisateur n'a pas encore de compte. Invitez-le à s'inscrire ou à vérifier l'orthographe de son adresse email."
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }
    
    // Vérifier les identités de l'utilisateur
    const identities = user.identities || []
    const hasFacebookIdentity = identities.some(id => id.provider === 'facebook' && id.identity_data?.email === userEmail)
    const hasGoogleIdentity = identities.some(id => id.provider === 'google' && id.identity_data?.email === userEmail)
    const hasEmailIdentity = identities.some(id => id.provider === 'email')
    
    // Vérifier si l'utilisateur a un abonnement actif
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (subError) {
      console.error('Erreur lors de la vérification de l\'abonnement:', subError);
    }
    
    // Préparer la recommandation
    let recommendation = ""
    
    if (!hasEmailIdentity && !hasFacebookIdentity && !hasGoogleIdentity) {
      recommendation = "Cet utilisateur n'a pas de méthode d'authentification complète. Envoyez-lui un lien magique pour aider à finaliser son compte."
    } else if (hasEmailIdentity) {
      recommendation = "Cet utilisateur a un compte avec mot de passe. En cas de problème de connexion, proposez une réinitialisation de mot de passe ou envoyez un lien magique."
    } else if (hasFacebookIdentity || hasGoogleIdentity) {
      recommendation = "Cet utilisateur se connecte via " + (hasFacebookIdentity ? "Facebook" : "Google") + ". Conseillez-lui d'utiliser le bouton correspondant pour se connecter."
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email: userEmail,
        userId: user.id,
        diagnosticInfo: {
          userFound: true,
          hasFacebookIdentity,
          hasGoogleIdentity,
          hasEmailIdentity,
          subscription: subscription || null,
          recommendation
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Erreur générale:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Erreur lors du diagnostic',
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
