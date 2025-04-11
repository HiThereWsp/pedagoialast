export const useAnalytics = () => {
  const logEvent = (eventName: string) => {
    // Pour l'instant, on ne fait rien
    console.log('Analytics event:', eventName);
  };

  return { logEvent };
}; 