
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

export async function logErrorToDatabase(userId: string | undefined, prompt: string | undefined, errorMessage: string): Promise<void> {
  if (!userId) return;
  
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    await supabaseAdmin
      .from('image_generation_usage')
      .insert({
        user_id: userId,
        prompt: prompt || 'Prompt inconnu',
        status: 'error',
        error_message: errorMessage
      });
  } catch (logError) {
    console.error('Erreur lors de l\'enregistrement de l\'erreur:', logError);
  }
}
