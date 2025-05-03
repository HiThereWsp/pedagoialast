import { supabase } from '@/integrations/supabase/client';

// Types
export interface MusicLessonParams {
  classLevel: string;
  subject: string;
  concept: string;
  musicGenre: string;
  learningPoints: string;
  fromText?: string;
  creationMode: 'create' | 'fromText';
}

export interface SaveMusicLessonParams {
  title: string;
  content: string;
  lyrics: string;
  subject?: string;
  class_level?: string;
  music_genre?: string;
}

// Cache
let musicLessonsCache: any[] | null = null;
let lastFetchTime = 0;

// Vérifier si le cache est valide (moins de 5 minutes)
const isCacheValid = () => {
  return musicLessonsCache !== null && Date.now() - lastFetchTime < 5 * 60 * 1000;
};

export const musicLessonsService = {
  // Générer des paroles de chanson
  async generate(params: MusicLessonParams) {
    try {
      console.log('Génération de paroles de chanson:', params);
      
      const prompt = this.buildPrompt(params);
      console.log('Prompt utilisé:', prompt);
      
      // Appel à la fonction edge de Supabase
      const { data, error } = await supabase.functions.invoke('generate-lyrics', {
        body: { 
          prompt: prompt,
          params: params
        }
      });
      
      if (error) {
        console.error("Erreur lors de l'appel à la fonction edge:", error);
        throw error;
      }
      
      // Si pas de réponse, utiliser une version simulée (fallback)
      if (!data || !data.lyrics) {
        console.warn("Pas de réponse de l'API, utilisation de données simulées");
        return this.generateFallbackLyrics(params);
      }
      
      return {
        title: data.title || `Chanson sur ${params.concept}`,
        content: data.content || `Leçon en musique pour le niveau ${params.classLevel} en ${params.subject}`,
        lyrics: data.lyrics,
      };
    } catch (error) {
      console.error('Erreur lors de la génération des paroles:', error);
      // En cas d'erreur, utiliser le fallback
      return this.generateFallbackLyrics(params);
    }
  },

  // Version de secours si l'API échoue
  generateFallbackLyrics(params: MusicLessonParams) {
    let lyrics = '';
    let title = '';
    
    if (params.creationMode === 'create') {
      title = `Chanson sur ${params.concept}`;
      lyrics = `Titre: Cinq à la ligne

Refrain:
Cinq, dix, quinze, vingt,
Chantons ensemble, c'est amusant !
Vingt-cinq, trente, trente-cinq, quarante,
Les multiples de cinq, c'est épatant !

Couplet 1:
Quand je compte par cinq, c'est un jeu,
Chaque doigt sur ma main, c'est un feu.
Cinq petits pas, je saute avec gaieté,
Cinq à cinq, je vais te montrer !`;
    } else {
      // Mode "À partir d'un texte"
      title = `Chanson basée sur un texte - ${params.subject}`;
      
      // Simuler une transformation du texte source en chanson
      const sourceText = params.fromText || '';
      const lines = sourceText.split('\n').filter(line => line.trim());
      const shortText = lines.slice(0, 4).join('\n');
      
      lyrics = `Titre: ${params.subject} en chanson

Couplet 1:
${shortText}
      
Refrain:
${params.learningPoints}
C'est notre objectif à atteindre
${params.learningPoints}
Pour avancer et grandir

Couplet 2:
Avec cette chanson en tête
Les élèves de ${params.classLevel} vont comprendre
Cette leçon de ${params.subject}
Devient plus facile à apprendre`;
    }
    
    return {
      title: title,
      content: `Leçon en musique pour le niveau ${params.classLevel} en ${params.subject}`,
      lyrics: lyrics,
    };
  },

  // Construire le prompt pour l'IA
  buildPrompt(params: MusicLessonParams) {
    // Déterminer si on utilise un texte source ou non
    const hasSourceText = params.fromText && params.fromText.trim().length > 0;
    
    if (!hasSourceText) {
      return `En tant qu'expert en pédagogie et en écriture de chansons, crée des paroles de chanson éducatives pour des élèves de ${params.classLevel} sur la matière "${params.subject}".
      
      Objectif d'apprentissage à inclure: ${params.learningPoints}
      
      Format de la chanson:
      - Structure avec un titre pertinent, un refrain accrocheur et 2 à 3 couplets maximum
      - Vocabulaire adapté au niveau des élèves de ${params.classLevel}
      - Intégration claire et pédagogique de l'objectif d'apprentissage
      - Paroles faciles à retenir et à chanter
      - Le contenu doit être concis et efficace pédagogiquement
      
      Respecte ce format exact pour les titres de sections:
      "Titre: [Nom de la chanson]" en première ligne
      "Refrain:" pour introduire le refrain
      "Couplet 1:", "Couplet 2:", etc. pour les couplets
      
      N'utilise pas d'astérisques, de crochets ou d'autres marqueurs spéciaux dans ton texte.
      Fournis une chanson complète avec séparation claire des sections, mais limite-toi à 3 couplets maximum.`;
    } else {
      return `En tant qu'expert en pédagogie et en écriture de chansons, transforme ce texte en paroles de chanson éducatives pour des élèves de ${params.classLevel} sur la matière "${params.subject}".
      
      Objectif d'apprentissage à inclure: ${params.learningPoints}
      
      Texte source à transformer:
      ${params.fromText}
      
      Consignes:
      - Conserve les idées et concepts principaux du texte source
      - Adapte le vocabulaire au niveau des élèves de ${params.classLevel}
      - Intègre clairement l'objectif d'apprentissage dans les paroles
      - Crée une structure avec un refrain accrocheur et 2 à 3 couplets maximum
      - Rends les paroles faciles à retenir et à chanter
      - Le contenu doit être concis et efficace pédagogiquement
      
      Respecte ce format exact pour les titres de sections:
      "Titre: [Nom de la chanson]" en première ligne
      "Refrain:" pour introduire le refrain
      "Couplet 1:", "Couplet 2:", etc. pour les couplets
      
      N'utilise pas d'astérisques, de crochets ou d'autres marqueurs spéciaux dans ton texte.
      Fournis une chanson complète avec séparation claire des sections, mais limite-toi à 3 couplets maximum.`;
    }
  },

  // Sauvegarder une leçon en chanson
  async save(params: SaveMusicLessonParams) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Non authentifié');
      }

      const { data, error } = await supabase
        .from('saved_music_lessons')
        .insert({
          user_id: user.id,
          title: params.title,
          content: params.content,
          lyrics: params.lyrics,
          subject: params.subject,
          class_level: params.class_level,
          music_genre: params.music_genre,
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la sauvegarde de la leçon en chanson:', error);
        throw error;
      }

      // Invalider le cache
      musicLessonsCache = null;
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la leçon en chanson:', error);
      throw error;
    }
  },

  // Récupérer toutes les leçons en chanson
  async getAll() {
    if (isCacheValid()) {
      console.log('Utilisation du cache pour les leçons en chanson');
      return musicLessonsCache!;
    }
    
    try {
      console.log('Récupération des leçons en chanson depuis la base');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Erreur de récupération: Utilisateur non authentifié');
        throw new Error('Non authentifié');
      }

      const { data, error } = await supabase
        .from('saved_music_lessons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des leçons en chanson:', error);
        throw error;
      }

      console.log(`${data?.length || 0} leçons en chanson récupérées`);

      const transformedData = (data || []).map(lesson => ({
        ...lesson,
        type: 'music-lesson' as const,
        displayType: 'Chanson',
        tags: [{
          label: 'Chanson',
          color: '#AC7AB5',
          backgroundColor: '#AC7AB520',
          borderColor: '#AC7AB54D'
        }]
      }));

      musicLessonsCache = transformedData;
      lastFetchTime = Date.now();

      return transformedData;
    } catch (error) {
      console.error('Erreur lors de la récupération des leçons en chanson:', error);
      return [];
    }
  },

  // Supprimer une leçon en chanson
  async delete(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Non authentifié');
      }

      const { error } = await supabase
        .from('saved_music_lessons')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la suppression de la leçon en chanson:', error);
        throw error;
      }

      // Invalider le cache
      musicLessonsCache = null;
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la leçon en chanson:', error);
      throw error;
    }
  }
}; 