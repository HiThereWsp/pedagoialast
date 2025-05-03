// Types d'événements pour la cohérence
export enum EventType {
  SIGNUP = "signup",
  FIRST_LOGIN = "first_login",
  TOOL_OPENED = "tool_opened",
  SEQUENCE_GENERATED = "sequence_generated",
  SEQUENCE_MODIFIED = "sequence_modified",
  GENERATION_FEEDBACK = "generation_feedback",
  SEQUENCE_SAVED = "sequence_saved",
  DIFFERENTIATE_TAB_CLICKED = "differentiate_tab_clicked",
  DIFFERENTIATE_BUTTON_CLICKED = "differentiate_button_clicked",
  CORRESPONDENCE_GENERATED = "correspondence_generated", 
  CORRESPONDENCE_CUSTOMIZE_CLICKED = "correspondence_customize_clicked",
  CORRESPONDENCE_EXPORTED = "correspondence_exported",
  IMAGE_GENERATED = "image_generated",
  IMAGE_DOWNLOADED = "image_downloaded",
  IMAGE_REGENERATED = "image_regenerated",
  PAGE_VISIT = "page_visit",
  SUBSCRIPTION_STARTED = "subscription_started",
  EXERCISE_GENERATED = "exercise_generated",
  EXERCISE_MODIFIED = "exercise_modified"
}

// Type d'outil
export enum ToolType {
  LESSON_PLAN = "lesson_plan",
  EXERCISE_CREATOR = "exercise_creator",
  CORRESPONDENCE = "correspondence",
  IMAGE_GENERATION = "image_generation"
}

// Type pour les paramètres de tracking
export interface TrackingParams {
  [key: string]: any;
}

/**
 * Fonction centrale pour le tracking des événements
 * @param eventName Nom de l'événement à tracker
 * @param params Paramètres additionnels pour l'événement
 */
export const trackEvent = (eventName: string, params: TrackingParams = {}) => {
  if (typeof window !== 'undefined' && window.datafast) {
    window.datafast(eventName, params);
    console.log(`[Analytics] Event tracked: ${eventName}`, params);
  } else {
    console.log(`[Analytics] Window datafast not available, would track: ${eventName}`, params);
  }
};

/**
 * Tracker l'ouverture d'un outil
 * @param tool Outil qui est ouvert
 * @param params Paramètres additionnels
 */
export const trackToolOpened = (tool: string, params: TrackingParams = {}) => {
  trackEvent(EventType.TOOL_OPENED, { tool, ...params });
};

/**
 * Tracker la génération de contenu selon l'outil
 * @param tool Outil utilisé pour la génération
 * @param params Paramètres additionnels
 */
export const trackGeneration = (tool: string, params: TrackingParams = {}) => {
  let eventName = "";
  
  switch(tool) {
    case ToolType.LESSON_PLAN:
      eventName = EventType.SEQUENCE_GENERATED;
      break;
    case ToolType.EXERCISE_CREATOR:
      eventName = EventType.EXERCISE_GENERATED;
      break;
    case ToolType.CORRESPONDENCE:
      eventName = EventType.CORRESPONDENCE_GENERATED;
      break;
    case ToolType.IMAGE_GENERATION:
      eventName = EventType.IMAGE_GENERATED;
      break;
    default:
      eventName = "item_generated";
  }
  
  trackEvent(eventName, { tool, ...params });
};

/**
 * Tracker un feedback sur une génération
 * @param tool Outil concerné par le feedback
 * @param value Valeur du feedback (positive/negative)
 * @param params Paramètres additionnels
 */
export const trackFeedback = (tool: string, value: 'positive' | 'negative', params: TrackingParams = {}) => {
  trackEvent(EventType.GENERATION_FEEDBACK, { tool, value, ...params });
};

/**
 * Tracker un clic sur le tab Différencier
 * @param identifier Identifiant de l'action
 * @param params Paramètres additionnels
 */
export const trackDifferentiateTabClicked = (identifier: string, params: TrackingParams = {}) => {
  trackEvent(EventType.DIFFERENTIATE_TAB_CLICKED, { 
    tool: ToolType.EXERCISE_CREATOR,
    identifier,
    ...params 
  });
};

/**
 * Tracker un clic sur le bouton Différencier
 * @param differentiationType Type de différenciation
 * @param params Paramètres additionnels
 */
export const trackDifferentiateButtonClicked = (differentiationType: string, params: TrackingParams = {}) => {
  trackEvent(EventType.DIFFERENTIATE_BUTTON_CLICKED, { 
    tool: ToolType.EXERCISE_CREATOR,
    differentiation_type: differentiationType,
    ...params 
  });
};

/**
 * Tracker le début d'un processus d'abonnement
 * @param planId ID du plan d'abonnement
 * @param planName Nom du plan d'abonnement
 */
export const trackSubscriptionStarted = (planId: string, planName: string) => {
  trackEvent(EventType.SUBSCRIPTION_STARTED, {
    plan: planName,
    plan_id: planId
  });
}; 