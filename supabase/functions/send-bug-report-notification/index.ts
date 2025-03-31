
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

// Main entry point for the Edge Function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { reportId, description, screenshotUrl, url, userId } = await req.json();
    
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    console.log("Retrieving bug report details for ID:", reportId);
    
    // Use our new function to get the report with user details
    const { data: report, error: reportError } = await supabaseAdmin
      .rpc('get_bug_report_with_user_details', { report_id: reportId })
      .single();
      
    if (reportError) {
      console.error("Error retrieving bug report details:", reportError);
      throw reportError;
    }
    
    if (!report) {
      console.error("No report found with ID:", reportId);
      throw new Error("Bug report not found");
    }

    console.log("Report retrieved successfully:", report.id);
    
    // Format email HTML content
    const emailHtml = `
      <h1>Nouveau rapport de bug</h1>
      <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
      <p><strong>Utilisateur:</strong> ${report.user_email || 'Utilisateur non connecté'}</p>
      <p><strong>URL:</strong> ${report.url || url}</p>
      <h2>Description</h2>
      <div style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9;">
        ${report.description?.replace(/\n/g, '<br>') || description}
      </div>
      ${report.screenshot_url || screenshotUrl ? `
        <h2>Capture d'écran</h2>
        <img src="${report.screenshot_url || screenshotUrl}" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px;" />
      ` : ''}
      <h2>Informations techniques</h2>
      <pre style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9; overflow: auto;">
${JSON.stringify(report.browser_info || {}, null, 2)}
      </pre>
      <p>
        <a href="${Deno.env.get('APP_URL') || 'https://app.pedagoia.fr'}/admin/bug-reports/${report.id}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px;">
          Voir le rapport complet
        </a>
      </p>
    `;

    console.log("Sending email notification");

    // Send the email with the function
    const { data: emailResult, error: emailError } = await supabaseAdmin.functions.invoke('send-email', {
      body: {
        to: ['bonjour@pedagoia.fr'],
        subject: `[BUG] Nouveau rapport - ${report.description?.slice(0, 50) || description.slice(0, 50)}${(report.description || description).length > 50 ? '...' : ''}`,
        html: emailHtml,
      }
    });

    if (emailError) {
      console.error("Error sending email notification:", emailError);
      throw emailError;
    }

    console.log("Email notification sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: 'Notification envoyée avec succès' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in bug report notification:', error);
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
