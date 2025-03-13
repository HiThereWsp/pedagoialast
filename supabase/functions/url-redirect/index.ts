
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  // Gestion des requêtes OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Initialisation du client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Extraire le chemin de l'URL demandée
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/url-redirect\//, '');
    
    console.log(`Traitement de la redirection pour le chemin: ${path}`);

    if (!path) {
      return new Response(JSON.stringify({ error: 'Chemin non spécifié' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Rechercher la redirection dans la base de données
    const { data: redirect, error: redirectError } = await supabaseClient
      .from('url_redirects')
      .select('id, target_url')
      .eq('short_path', path)
      .single();

    if (redirectError || !redirect) {
      console.error('Redirection non trouvée:', path, redirectError);
      return new Response(JSON.stringify({ error: 'Redirection non trouvée' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Enregistrer le log de redirection
    const { error: logError } = await supabaseClient
      .from('redirect_logs')
      .insert({
        redirect_id: redirect.id,
        user_agent: req.headers.get('user-agent') || null,
        referer: req.headers.get('referer') || null,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
      });

    if (logError) {
      console.error('Erreur lors de l\'enregistrement du log:', logError);
      // Ne pas échouer la redirection si le log ne fonctionne pas
    }

    // Rediriger vers l'URL cible
    console.log(`Redirection vers: ${redirect.target_url}`);
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirect.target_url,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
    });

  } catch (error) {
    console.error('Erreur lors de la redirection:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
