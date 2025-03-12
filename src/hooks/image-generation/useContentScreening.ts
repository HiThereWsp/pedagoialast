
import { useMemo } from 'react';
import { ContentScreeningResult } from './types';

export const useContentScreening = () => {
  // Liste de mots inappropriés
  const inappropriateWords = useMemo(() => [
    'nude', 'naked', 'porn', 'sex', 'violence', 'gore', 'blood',
    'death', 'kill', 'weapon', 'drug', 'cocaine', 'heroin'
  ], []);
  
  const screenContent = (text: string): ContentScreeningResult => {
    const inappropriateWord = inappropriateWords.find(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );
    
    if (inappropriateWord) {
      return {
        isInappropriate: true,
        reason: `Le texte contient un mot inapproprié: "${inappropriateWord}"`
      };
    }
    
    return { isInappropriate: false };
  };

  const containsInappropriateContent = (text: string): boolean => {
    return inappropriateWords.some(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );
  };

  return {
    screenContent,
    containsInappropriateContent
  };
};
