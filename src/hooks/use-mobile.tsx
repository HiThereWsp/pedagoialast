
import { useState, useEffect } from 'react';

/**
 * Hook pour détecter si un media query correspond
 * @param query Media query à vérifier
 * @returns boolean Indique si le media query correspond
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Définir la valeur initiale
    setMatches(media.matches);
    
    // Définir un gestionnaire pour les changements
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Ajouter l'écouteur
    media.addEventListener('change', listener);
    
    // Nettoyer
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
};

/**
 * Hook pour détecter si l'appareil est mobile
 * @returns boolean True si l'appareil est considéré comme mobile
 */
export const useMobile = (): boolean => {
  return useMediaQuery('(max-width: 768px)');
};

// Pour la compatibilité avec le code existant
export const useIsMobile = useMobile;
