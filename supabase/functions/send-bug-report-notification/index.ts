
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BugReportNotificationPayload {
  reportId: string;
  description: string;
  screenshotUrl?: string;
  url?: string;
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the request data
    const payload = await req.json() as BugReportNotificationPayload;
    
    if (!payload || !payload.reportId || !payload.description) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get admin emails
    const { data: adminUsers, error: adminError } = await supabaseClient
      .from('user_profiles')
      .select('user_email')
      .eq('is_admin', true);

    if (adminError) {
      console.error('Error fetching admin users:', adminError);
      throw adminError;
    }

    // Get bug report with details
    const { data: reportData, error: reportError } = await supabaseClient.rpc(
      'get_bug_report_with_user_details',
      { report_id: payload.reportId }
    );

    if (reportError) {
      console.error('Error fetching bug report details:', reportError);
      throw reportError;
    }

    const report = reportData[0];
    if (!report) {
      return new Response(
        JSON.stringify({ error: 'Bug report not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If we have Brevo API key, send email notification to admins
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    if (brevoApiKey && adminUsers && adminUsers.length > 0) {
      const adminEmails = adminUsers.map(admin => admin.user_email).filter(Boolean);
      
      if (adminEmails.length > 0) {
        const screenshotHtml = payload.screenshotUrl 
          ? `<p><strong>Capture d'écran:</strong> <a href="${payload.screenshotUrl}" target="_blank">Voir la capture d'écran</a></p>` 
          : '';
          
        const urlHtml = payload.url 
          ? `<p><strong>URL:</strong> <a href="${payload.url}" target="_blank">${payload.url}</a></p>` 
          : '';
          
        const userHtml = report.user_email 
          ? `<p><strong>Utilisateur:</strong> ${report.user_email}</p>` 
          : '<p><strong>Utilisateur:</strong> Anonyme</p>';

        // Prepare email to admins
        const emailData = {
          sender: {
            name: 'PedagoIA - Notifications',
            email: 'notifications@pedagogia.app'
          },
          to: adminEmails.map(email => ({ email })),
          subject: '🐛 Nouveau signalement de bug sur PedagoIA',
          htmlContent: `
            <h1 style="color:#4f46e5">Nouveau signalement de bug</h1>
            <p>Un nouveau signalement de bug a été soumis sur PedagoIA.</p>
            <h2>Détails du signalement</h2>
            ${userHtml}
            <p><strong>Date:</strong> ${new Date(report.created_at).toLocaleString('fr-FR')}</p>
            <p><strong>Description:</strong></p>
            <div style="background-color:#f3f4f6;padding:15px;border-radius:5px;margin:10px 0;">
              ${payload.description.replace(/\n/g, '<br>')}
            </div>
            ${urlHtml}
            ${screenshotHtml}
            <div style="margin-top:30px">
              <a href="https://app.pedagogia.fr/admin/bug-reports" style="background-color:#4f46e5;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;font-weight:bold;">
                Voir tous les signalements
              </a>
            </div>
          `
        };

        // Send email via Brevo API
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': brevoApiKey
          },
          body: JSON.stringify(emailData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error sending email via Brevo:', errorText);
          throw new Error(`Brevo API error: ${errorText}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Bug report notification sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in bug report notification function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
