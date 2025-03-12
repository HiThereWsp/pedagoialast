
import { useMemo } from 'react';

export const useContentScreening = () => {
  // Liste de mots inappropriés
  const inappropriateWords = useMemo(() => [
    'nude', 'naked', 'porn', 'sex', 'violence', 'gore', 'blood',
    'death', 'kill', 'weapon', 'drug', 'cocaine', 'heroin'
  ], []);
  
  const containsInappropriateContent = (text: string): boolean => {
    return inappropriateWords.some(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );
  };

  return {
    containsInappropriateContent
  };
};
