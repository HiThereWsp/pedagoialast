import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts"; // Assurez-vous que ce chemin est correct

// --- Logique de Hachage (copiée depuis src/utils/hashUtils.ts) ---
// En production, envisagez de la placer dans un fichier _shared
async function sha256Hash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
async function hashEmail(email: string): Promise<string> {
  const normalized = email.toLowerCase().trim();
  return sha256Hash(normalized);
}
async function hashPhone(phone: string): Promise<string> {
  const digitsOnly = phone.replace(/\D/g, '');
  return sha256Hash(digitsOnly);
}
async function hashName(name: string): Promise<string> {
  const normalized = name.toLowerCase().trim();
  return sha256Hash(normalized);
}
async function hashZipcode(zipcode: string): Promise<string> {
  const normalized = zipcode.replace(/\s/g, '');
  return sha256Hash(normalized);
}
// --- Fin de la Logique de Hachage ---

// Interfaces (simplifiées pour la fonction Edge)
interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  zipCode?: string;
  subscriptionId?: string;
  client_user_agent?: string; // Ajouté ici car passé depuis le client
}

interface CustomData {
  [key: string]: any;
}

type EventName = string; // Type plus générique pour la fonction

interface EventOptions {
  event_id?: string;
  event_source_url?: string;
  attribution_share?: number;
  test_event_code?: string;
  pixel_id?: string;
}

// Récupération sécurisée des secrets
const META_ACCESS_TOKEN = Deno.env.get("META_CAPI_ACCESS_TOKEN");
const DEFAULT_PIXEL_ID = Deno.env.get("META_CAPI_PIXEL_ID");
const API_VERSION = 'v18.0';

serve(async (req) => {
  // Gérer la requête CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Vérifier si les secrets sont configurés
  if (!META_ACCESS_TOKEN || !DEFAULT_PIXEL_ID) {
    console.error("Meta CAPI secrets (META_CAPI_ACCESS_TOKEN, META_CAPI_PIXEL_ID) non configurés dans Supabase.");
    return new Response(JSON.stringify({ error: "Configuration serveur manquante." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Parser le corps de la requête
    const { eventName, userData, customData, options } = await req.json();

    if (!eventName || !userData) {
      return new Response(JSON.stringify({ error: "Données d'événement manquantes (eventName, userData requis)." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const effectiveOptions: EventOptions = options || {};
    const targetPixelId = effectiveOptions.pixel_id || DEFAULT_PIXEL_ID;

    // Préparer et hacher les données utilisateur
    const hashedUserData: Record<string, any> = {};
    if (userData.email) hashedUserData.em = [await hashEmail(userData.email)];
    if (userData.phone) hashedUserData.ph = [await hashPhone(userData.phone)];
    if (userData.firstName) hashedUserData.fn = [await hashName(userData.firstName)];
    if (userData.zipCode) hashedUserData.zp = [await hashZipcode(userData.zipCode)];
    if (userData.subscriptionId) hashedUserData.subscription_id = userData.subscriptionId;
    // Inclure l'agent utilisateur s'il est fourni par le client
    if (userData.client_user_agent) hashedUserData.client_user_agent = userData.client_user_agent;

    // Construire la charge utile pour Meta
    const eventTime = Math.floor(Date.now() / 1000);
    const eventId = effectiveOptions.event_id || `${eventName.toLowerCase()}_${eventTime}_${Math.random().toString(36).substring(2, 9)}`;

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          event_id: eventId,
          action_source: "website",
          event_source_url: effectiveOptions.event_source_url,
          user_data: hashedUserData,
          custom_data: customData || {},
          ...(effectiveOptions.attribution_share && {
            attribution_data: {
              attribution_share: effectiveOptions.attribution_share.toString(),
            },
          }),
        },
      ],
      ...(effectiveOptions.test_event_code && { test_event_code: effectiveOptions.test_event_code }),
    };

    // Construire l'URL de l'API Meta
    const apiUrl = `https://graph.facebook.com/${API_VERSION}/${targetPixelId}/events?access_token=${META_ACCESS_TOKEN}`;

    // Appeler l'API Meta
    const metaResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseData = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error("Erreur API Meta Conversions:", responseData);
      // Ne pas renvoyer l'erreur détaillée au client pour des raisons de sécurité
      return new Response(JSON.stringify({ success: false, error: "Échec de l'envoi de l'événement serveur." }), {
        status: metaResponse.status, // Retourner le statut d'erreur de Meta
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Événement Meta CAPI envoyé avec succès:", eventName, eventId);
    return new Response(JSON.stringify({ success: true, response: responseData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erreur dans la fonction Edge send-meta-capi-event:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}); 