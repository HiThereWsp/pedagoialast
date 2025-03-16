
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
      );
    }

    // Initialiser le client Supabase avec le rôle de service pour contourner RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Trouver l'utilisateur par email
    const { data: users, error: userError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email')
      .eq('email', userEmail)
      .limit(1);

    if (userError) {
      console.error('Erreur lors de la recherche de l\'utilisateur:', userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Erreur lors de la recherche de l\'utilisateur',
          error: userError.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    if (!users || users.length === 0) {
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

    const user = users[0];
    
    // Vérifier si l'utilisateur a déjà un abonnement actif
    const { data: existingSub, error: existingSubError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
      
    if (existingSubError) {
      console.error('Erreur lors de la vérification de l\'abonnement:', existingSubError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Erreur lors de la vérification de l\'abonnement',
          error: existingSubError.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    let response;
    
    // Si un abonnement existe, le mettre à jour, sinon en créer un nouveau
    if (existingSub) {
      // Mettre à jour l'abonnement existant
      const { data: updatedSub, error: updateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          type: 'beta',
          status: 'active',
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 an
        })
        .eq('id', existingSub.id)
        .select()
        .single();
        
      if (updateError) {
        console.error('Erreur lors de la mise à jour de l\'abonnement:', updateError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Erreur lors de la mise à jour de l\'abonnement',
            error: updateError.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      response = {
        success: true,
        message: 'Accès beta mis à jour avec succès',
        subscription: updatedSub
      };
    } else {
      // Créer un nouvel abonnement beta
      const { data: newSub, error: insertError } = await supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          type: 'beta',
          status: 'active',
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 an
        })
        .select()
        .single();
        
      if (insertError) {
        console.error('Erreur lors de la création de l\'abonnement beta:', insertError);
        
        // Vérifier si l'erreur est liée à la colonne 'type'
        if (insertError.message.includes('type') && insertError.message.includes('does not exist')) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'Erreur de type de données: le type "beta" n\'est pas défini dans l\'énumération subscription_type',
              error: insertError.message,
              solution: 'Veuillez vérifier que l\'énumération subscription_type dans la base de données inclut la valeur "beta"'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Erreur lors de la création de l\'abonnement beta',
            error: insertError.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      response = {
        success: true,
        message: 'Accès beta accordé avec succès',
        subscription: newSub
      };
    }

    // Journaliser l'action à des fins d'audit
    await supabaseAdmin
      .from('admin_actions')
      .insert({
        action_type: 'assign_beta_access',
        admin_id: 'system', // Ceci devrait être l'ID admin réel dans une implémentation réelle
        target_user_id: user.id,
        details: { email: user.email }
      });

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Erreur dans assign-beta-access:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Erreur lors de l\'attribution d\'accès beta',
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
