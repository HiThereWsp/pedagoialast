
import { corsHeaders } from "../_shared/cors.ts";
import { createResponse, logError } from "../_shared/utils.ts";

export const updateExistingSubscription = async (supabaseAdmin: any, subscriptionId: string) => {
  try {
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 an
    
    const { data: updatedSub, error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        type: 'beta',
        status: 'active',
        expires_at: expiryDate.toISOString()
      })
      .eq('id', subscriptionId)
      .select()
      .single();
      
    if (updateError) {
      console.error('Erreur lors de la mise à jour de l\'abonnement:', updateError);
      return { 
        success: false, 
        error: updateError,
        response: createResponse(
          { 
            success: false, 
            message: 'Erreur lors de la mise à jour de l\'abonnement',
            error: updateError.message 
          },
          { 
            headers: corsHeaders,
            status: 500 
          }
        )
      };
    }
    
    return { 
      success: true, 
      subscription: updatedSub,
      message: 'Accès beta mis à jour avec succès'
    };
  } catch (error) {
    const errorMessage = logError('mise à jour abonnement', error);
    return { 
      success: false,
      error,
      response: createResponse(
        { 
          success: false, 
          message: 'Erreur lors de la mise à jour de l\'abonnement',
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

export const createNewSubscription = async (supabaseAdmin: any, userId: string) => {
  try {
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 an
    
    const { data: newSub, error: insertError } = await supabaseAdmin
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        type: 'beta',
        status: 'active',
        expires_at: expiryDate.toISOString()
      })
      .select()
      .single();
      
    if (insertError) {
      console.error('Erreur lors de la création de l\'abonnement beta:', insertError);
      
      // Vérifier si l'erreur est liée à la colonne 'type'
      if (insertError.message.includes('type') && insertError.message.includes('does not exist')) {
        return { 
          success: false, 
          error: insertError,
          response: createResponse(
            { 
              success: false, 
              message: 'Erreur de type de données: le type "beta" n\'est pas défini dans l\'énumération subscription_type',
              error: insertError.message,
              solution: 'Veuillez vérifier que l\'énumération subscription_type dans la base de données inclut la valeur "beta"'
            },
            { 
              headers: corsHeaders,
              status: 500 
            }
          )
        };
      }
      
      return { 
        success: false, 
        error: insertError,
        response: createResponse(
          { 
            success: false, 
            message: 'Erreur lors de la création de l\'abonnement beta',
            error: insertError.message 
          },
          { 
            headers: corsHeaders,
            status: 500 
          }
        )
      };
    }
    
    return { 
      success: true, 
      subscription: newSub,
      message: 'Accès beta accordé avec succès'
    };
  } catch (error) {
    const errorMessage = logError('création abonnement', error);
    return { 
      success: false,
      error,
      response: createResponse(
        { 
          success: false, 
          message: 'Erreur lors de la création de l\'abonnement beta',
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
