import { supabase } from "@/integrations/supabase/client"; // Importer le client Supabase
// Suppression des imports de hachage car le hachage se fera côté fonction Edge
// import { hashEmail, hashName, hashPhone, hashZipcode } from "@/utils/hashUtils";

// Suppression des constantes CAPI car elles sont maintenant dans les secrets Supabase
// const API_VERSION = 'v18.0';
// const META_ACCESS_TOKEN = import.meta.env.VITE_META_CAPI_ACCESS_TOKEN;
// const DEFAULT_PIXEL_ID = import.meta.env.VITE_META_CAPI_PIXEL_ID;

// Reprendre les mêmes IDs de pixel du module client existant
import { FB_PIXEL_IDS } from "@/integrations/meta-pixel/client";

// Interface pour les données utilisateur (simplifiée, pas besoin de hachage ici)
interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  zipCode?: string;
  subscriptionId?: string;
  // client_user_agent sera ajouté avant l'appel à la fonction Edge
}

// Interface pour les données personnalisées
interface CustomData {
  currency?: string;
  value?: number;
  [key: string]: any;
}

// Types d'événements supportés
type EventName = 'Purchase' | 'Subscribe' | 'PageView' | 'Lead' | 'CompleteRegistration';

// Options de l'événement
interface EventOptions {
  event_id?: string;
  event_source_url?: string;
  attribution_share?: number;
  test_event_code?: string;
  pixel_id?: string; // Pour cibler un pixel spécifique
}

/**
 * Service pour envoyer des événements à l'API Conversions Meta via une fonction Edge Supabase
 */
export class MetaConversionsService {
  // Plus besoin de stocker le pixel ID par défaut ici, géré par la fonction Edge ou les options

  constructor() {
    // Le constructeur est maintenant vide ou peut faire d'autres initialisations si nécessaire
  }

  /**
   * Invoque la fonction Edge Supabase pour envoyer un événement à l'API Conversions Meta
   */
  public async sendEvent(
    eventName: EventName,
    userData: UserData,
    customData: CustomData = {},
    options: EventOptions = {}
  ): Promise<{ success: boolean; response?: any; error?: any }> {

    // Récupérer l'agent utilisateur côté client avant d'appeler la fonction Edge
    const client_user_agent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;
    
    // Préparer les données à envoyer à la fonction Edge
    const functionPayload = {
      eventName,
      // Passer les données utilisateur brutes, le hachage sera fait dans la fonction Edge
      userData: {
        ...userData,
        client_user_agent // Ajouter l'agent utilisateur
      },
      customData,
      options: {
        ...options,
        // Assurer que event_source_url est défini si possible
        event_source_url: options.event_source_url || (typeof window !== 'undefined' ? window.location.href : undefined)
      }
    };

    try {
      console.log(`[Meta CAPI Edge] Invoking function for event: ${eventName}`);
      const { data, error } = await supabase.functions.invoke('send-meta-capi-event', {
        body: functionPayload,
      });

      if (error) {
        console.error('[Meta CAPI Edge] Function invocation error:', error);
        return { success: false, error: error.message };
      }

      // La fonction Edge retourne { success: boolean, response?: any, error?: string }
      if (data && data.success === false) {
         console.error('[Meta CAPI Edge] Server-side event sending failed:', data.error);
         return { success: false, error: data.error || 'Erreur inconnue retournée par la fonction Edge.' };
      }

      console.log('[Meta CAPI Edge] Function invoked successfully:', data);
      return { success: true, response: data?.response }; // Renvoie la réponse de l'API Meta si succès

    } catch (error) {
      console.error('[Meta CAPI Edge] Unexpected error invoking function:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Envoie un événement d'abonnement via la fonction Edge
   * Cible le pixel SUCCESS par défaut
   */
  public async sendSubscriptionSuccessEvent(
    userData: UserData,
    plan: 'monthly' | 'yearly',
    price: number,
    predictedLtv?: number,
    options: EventOptions = {}
  ) {
    return this.sendEvent(
      'Subscribe',
      userData,
      {
        currency: 'EUR',
        value: price,
        subscription_type: plan,
        predicted_ltv: predictedLtv || price * (plan === 'yearly' ? 1 : 12),
        content_name: `premium_${plan}`,
        content_category: 'subscription',
        status: 'success'
      },
      { ...options, pixel_id: options.pixel_id || FB_PIXEL_IDS.SUCCESS } // Cible le pixel SUCCESS
    );
  }

  /**
   * Envoie un événement d'inscription terminée via la fonction Edge
   * Cible le pixel SIGNUP par défaut
   */
  public async sendSignupCompletedEvent(
    userData: UserData,
    options: EventOptions = {}
  ) {
    return this.sendEvent(
      'CompleteRegistration',
      userData,
      {
        content_name: 'signup_success',
        status: 'success'
      },
      { ...options, pixel_id: options.pixel_id || FB_PIXEL_IDS.SIGNUP } // Cible le pixel SIGNUP
    );
  }

  /**
   * Envoie un événement de prospect (Lead) via la fonction Edge
   */
  public async sendLeadEvent(
    userData: UserData,
    leadType: string, // Ex: 'school_form_complete', 'school_form_progress'
    step?: number,
    options: EventOptions = {}
  ) {
    const customData: CustomData = {
      content_name: leadType,
      content_category: 'school' // Ou une autre catégorie si pertinent
    };
    if (step) {
      customData.step = `step_${step}`;
    }
    return this.sendEvent(
      'Lead',
      userData,
      customData,
      options
    );
  }

}

// Exporter une instance par défaut du service
const metaConversionsService = new MetaConversionsService();
export default metaConversionsService; 