
import { corsHeaders } from "../_shared/cors.ts";
import { createResponse, logError } from "../_shared/utils.ts";

export const validateAdminToken = (adminToken: string | undefined): boolean => {
  if (!adminToken || adminToken !== Deno.env.get('ADMIN_SECRET_KEY')) {
    return false;
  }
  return true;
};

export const handleUnauthorized = () => {
  console.error('Tentative d\'accès non autorisée');
  return createResponse(
    { 
      success: false, 
      message: 'Non autorisé' 
    },
    { 
      headers: corsHeaders,
      status: 401 
    }
  );
};

export const validateRequest = async (req: Request) => {
  try {
    const { userEmail, adminToken } = await req.json();
    
    // Vérifier le token admin pour sécurité
    if (!validateAdminToken(adminToken)) {
      return { valid: false, response: handleUnauthorized() };
    }

    // Valider l'email
    if (!userEmail) {
      return {
        valid: false,
        response: createResponse(
          { 
            success: false, 
            message: 'Email utilisateur requis' 
          },
          { 
            headers: corsHeaders,
            status: 400 
          }
        )
      };
    }

    return { valid: true, data: { userEmail, adminToken } };
  } catch (error) {
    const errorMessage = logError('validation de la requête', error);
    return {
      valid: false,
      response: createResponse(
        { 
          success: false, 
          message: 'Erreur lors de la validation de la requête',
          error: errorMessage
        },
        { 
          headers: corsHeaders,
          status: 400 
        }
      )
    };
  }
};
