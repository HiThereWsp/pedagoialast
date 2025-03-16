
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";
import { createResponse, logError } from "../_shared/utils.ts";

export const initSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

export const findUserByEmail = async (supabaseAdmin: any, userEmail: string) => {
  try {
    const { data: users, error: userError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email')
      .eq('email', userEmail)
      .limit(1);

    if (userError) {
      console.error('Erreur lors de la recherche de l\'utilisateur:', userError);
      return { 
        success: false, 
        error: userError,
        response: createResponse(
          { 
            success: false, 
            message: 'Erreur lors de la recherche de l\'utilisateur',
            error: userError.message 
          },
          { 
            headers: corsHeaders,
            status: 500
          }
        )
      };
    }

    if (!users || users.length === 0) {
      return { 
        success: false,
        response: createResponse(
          { 
            success: false, 
            message: 'Utilisateur non trouvé' 
          },
          { 
            headers: corsHeaders,
            status: 404 
          }
        )
      };
    }

    return { success: true, user: users[0] };
  } catch (error) {
    const errorMessage = logError('recherche utilisateur', error);
    return { 
      success: false,
      error,
      response: createResponse(
        { 
          success: false, 
          message: 'Erreur lors de la recherche de l\'utilisateur',
          error: errorMessage
        },
        { 
          headers: corsHeaders,
          status: 500 
        }
      )
    };
  }
};

export const checkActiveSubscription = async (supabaseAdmin: any, userId: string) => {
  try {
    const { data: existingSub, error: existingSubError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
      
    if (existingSubError) {
      console.error('Erreur lors de la vérification de l\'abonnement:', existingSubError);
      return { 
        success: false, 
        error: existingSubError,
        response: createResponse(
          { 
            success: false, 
            message: 'Erreur lors de la vérification de l\'abonnement',
            error: existingSubError.message 
          },
          { 
            headers: corsHeaders,
            status: 500 
          }
        )
      };
    }
    
    return { success: true, subscription: existingSub };
  } catch (error) {
    const errorMessage = logError('vérification abonnement', error);
    return { 
      success: false,
      error,
      response: createResponse(
        { 
          success: false, 
          message: 'Erreur lors de la vérification de l\'abonnement',
          error: errorMessage
        },
        { 
          headers: corsHeaders,
          status: 500 
        }
      )
    };
  }
};

export const logAdminAction = async (supabaseAdmin: any, userId: string, email: string) => {
  try {
    await supabaseAdmin
      .from('admin_actions')
      .insert({
        action_type: 'assign_beta_access',
        admin_id: 'system',
        target_user_id: userId,
        details: { email }
      });
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la journalisation:', error);
    return { success: false, error };
  }
};
