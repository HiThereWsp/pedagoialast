
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

// Point d'entrée principal de l'Edge Function
serve(async (req) => {
  // Gérer les requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { reportId, description, screenshotUrl, url, userId } = await req.json();
    
    // Initialiser le client Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    // Récupérer les informations détaillées du rapport
    const { data: report, error: reportError } = await supabaseAdmin
      .from('bug_reports')
      .select('*, user:user_id(email)')
      .eq('id', reportId)
      .single();
      
    if (reportError) {
      console.error("Erreur lors de la récupération du rapport:", reportError);
      throw reportError;
    }

    // Format du corps de l'email
    const emailHtml = `
      <h1>Nouveau rapport de bug</h1>
      <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
      <p><strong>Utilisateur:</strong> ${report.user ? report.user.email : 'Utilisateur non connecté'}</p>
      <p><strong>URL:</strong> ${url}</p>
      <h2>Description</h2>
      <div style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9;">
        ${description.replace(/\n/g, '<br>')}
      </div>
      ${screenshotUrl ? `
        <h2>Capture d'écran</h2>
        <img src="${screenshotUrl}" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px;" />
      ` : ''}
      <h2>Informations techniques</h2>
      <pre style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9; overflow: auto;">
${JSON.stringify(JSON.parse(report.browser_info), null, 2)}
      </pre>
      <p>
        <a href="${Deno.env.get('APP_URL')}/admin/bug-reports/${reportId}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px;">
          Voir le rapport complet
        </a>
      </p>
    `;

    // Envoyer l'email avec la fonction existante
    const { data: emailResult, error: emailError } = await supabaseAdmin.functions.invoke('send-email', {
      body: {
        to: ['bonjour@pedagoia.fr'],
        subject: `[BUG] Nouveau rapport - ${description.slice(0, 50)}${description.length > 50 ? '...' : ''}`,
        html: emailHtml,
      }
    });

    if (emailError) {
      console.error("Erreur lors de l'envoi de l'email:", emailError);
      throw emailError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification envoyée avec succès' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Erreur générale:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        success: false,
        message: 'Erreur lors de l\'envoi de la notification'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
