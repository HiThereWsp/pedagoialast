
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createResponse, logError } from "../_shared/utils.ts";
import { validateRequest } from "./auth.ts";
import { 
  initSupabaseAdmin,
  findUserByEmail,
  checkActiveSubscription,
  logAdminAction
} from "./user-service.ts";
import {
  updateExistingSubscription,
  createNewSubscription
} from "./subscription-service.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Valider la requête
    const validationResult = await validateRequest(req);
    if (!validationResult.valid) {
      return validationResult.response;
    }
    
    const { userEmail } = validationResult.data;
    
    // Initialiser le client Supabase
    const supabaseAdmin = initSupabaseAdmin();
    
    // Trouver l'utilisateur par email
    const userResult = await findUserByEmail(supabaseAdmin, userEmail);
    if (!userResult.success) {
      return userResult.response;
    }
    
    const user = userResult.user;
    
    // Vérifier si l'utilisateur a déjà un abonnement actif
    const subscriptionResult = await checkActiveSubscription(supabaseAdmin, user.id);
    if (!subscriptionResult.success) {
      return subscriptionResult.response;
    }
    
    let response;
    
    // Si un abonnement existe, le mettre à jour, sinon en créer un nouveau
    if (subscriptionResult.subscription) {
      // Mettre à jour l'abonnement existant
      const updateResult = await updateExistingSubscription(
        supabaseAdmin, 
        subscriptionResult.subscription.id
      );
      
      if (!updateResult.success) {
        return updateResult.response;
      }
      
      response = {
        success: true,
        message: updateResult.message,
        subscription: updateResult.subscription
      };
    } else {
      // Créer un nouvel abonnement beta
      const createResult = await createNewSubscription(supabaseAdmin, user.id);
      
      if (!createResult.success) {
        return createResult.response;
      }
      
      response = {
        success: true,
        message: createResult.message,
        subscription: createResult.subscription
      };
    }

    // Journaliser l'action à des fins d'audit
    await logAdminAction(supabaseAdmin, user.id, user.email);

    return createResponse(response, { headers: corsHeaders });
  } catch (error) {
    const errorMessage = logError('assign-beta-access', error);
    return createResponse(
      { 
        success: false, 
        message: 'Erreur lors de l\'attribution d\'accès beta',
        error: errorMessage
      },
      { 
        headers: corsHeaders,
        status: 500 
      }
    );
  }
});
