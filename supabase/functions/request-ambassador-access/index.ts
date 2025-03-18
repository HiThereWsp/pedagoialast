
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extraire les données de la requête
    const { email, name, motivation } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialiser le client Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    // Authentifier l'utilisateur à partir du token Bearer
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header missing' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extraire et vérifier le token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Vérifier si l'utilisateur n'est pas déjà un ambassadeur
    const { data: existingAmbassador } = await supabaseAdmin
      .from('ambassador_program')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (existingAmbassador) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Vous avez déjà fait une demande pour devenir ambassadeur',
          status: existingAmbassador.status
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Créer l'enregistrement dans ambassador_program
    const { error: insertError } = await supabaseAdmin
      .from('ambassador_program')
      .insert({
        user_id: user.id,
        email: email,
        full_name: name || user.user_metadata?.full_name || user.user_metadata?.name,
        notes: `Motivation: ${motivation || 'Non spécifiée'}`,
        status: 'pending',
        requested_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('Erreur lors de l\'insertion dans ambassador_program:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'enregistrement de la demande' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Envoyer une notification par email (à implementer)
    try {
      // Notifier l'équipe PedagoIA
      await supabaseAdmin.functions.invoke('create-brevo-contact', {
        body: { 
          email: email,
          contactName: name || user.user_metadata?.full_name || 'Ambassadeur potentiel',
          userType: "ambassador_request",
          source: "ambassador_program_request"
        }
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de la notification:', emailError);
      // Ne pas bloquer le processus si l'email échoue
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Votre demande pour devenir ambassadeur a été enregistrée avec succès. Nous vous contacterons prochainement.' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Erreur générale:', error);
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue lors du traitement de votre demande' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
