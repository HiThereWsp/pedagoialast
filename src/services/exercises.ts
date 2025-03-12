import { supabase } from "@/integrations/supabase/client"
import type { SaveExerciseParams, ExtractedExercise, SavedContent, ExerciseCategory } from "@/types/saved-content"
import { isExerciseCategory } from "@/utils/type-guards"

// Cache local avec TTL plus long pour réduire les requêtes
let exercisesCache: SavedContent[] | null = null;
let lastFetchTime: number = 0;
const CACHE_TTL = 300000; // 5 minutes

// Fonction utilitaire pour vérifier si le cache est valide
const isCacheValid = () => {
  return exercisesCache && (Date.now() - lastFetchTime < CACHE_TTL);
};

export const exercisesService = {
  async save(params: SaveExerciseParams) {
    try {
      console.log('Début de la sauvegarde de l\'exercice:', params.title);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Erreur de sauvegarde: Utilisateur non authentifié');
        throw new Error('Non authentifié');
      }
      
      const exercise_category: ExerciseCategory = isExerciseCategory(params.exercise_category) 
        ? params.exercise_category 
        : 'standard';
      
      console.log('Sauvegarde avec catégorie:', exercise_category);
      
      // ⭐ MODIFICATION: Nous construisons le payload sans inclure le champ 'type'
      // qui n'existe pas dans la table saved_exercises
      const payload = {
        title: params.title,
        content: params.content,
        subject: params.subject,
        class_level: params.class_level,
        exercise_type: params.exercise_type,
        user_id: user.id,
        exercise_category,
        source_lesson_plan_id: params.source_lesson_plan_id,
        source_type: params.source_lesson_plan_id ? 'from_lesson_plan' : 'direct'
      };
      
      console.log('Payload de sauvegarde:', JSON.stringify({
        ...payload,
        content: payload.content.length > 50 ? `${payload.content.substring(0, 50)}...` : payload.content
      }));

      const { data, error } = await supabase
        .from('saved_exercises')
        .insert([payload])
        .select();

      if (error) {
        console.error('Erreur Supabase lors de la sauvegarde:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw error;
      }

      console.log('Exercice sauvegardé avec succès:', data);
      
      // Invalider le cache après modification
      exercisesCache = null;
      return data;
    } catch (err) {
      console.error('Erreur détaillée lors de la sauvegarde:', err);
      throw err;
    }
  },

  async getAll(): Promise<SavedContent[]> {
    if (isCacheValid()) {
      console.log('Utilisation du cache pour les exercices');
      return exercisesCache!;
    }
    
    try {
      console.log('Récupération des exercices depuis la base');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Erreur de récupération: Utilisateur non authentifié');
        throw new Error('Non authentifié');
      }

      const { data, error } = await supabase
        .from('saved_exercises')
        .select('*, saved_lesson_plans!saved_exercises_source_lesson_plan_id_fkey(title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des exercices:', error);
        throw error;
      }

      console.log(`${data?.length || 0} exercices récupérés`);

      const transformedData: SavedContent[] = (data || []).map(exercise => ({
        ...exercise,
        type: 'exercise' as const, // CORRECTION CRITIQUE: s'assurer que type est bien défini
        exercise_category: isExerciseCategory(exercise.exercise_category) ? exercise.exercise_category : 'standard',
        source_type: exercise.source_type as 'direct' | 'from_lesson_plan',
        tags: [{
          label: 'Exercice',
          color: '#22C55E',
          backgroundColor: '#22C55E20',
          borderColor: '#22C55E4D'
        }]
      }));

      // Journaliser un exemple d'élément transformé pour débogage
      if (transformedData.length > 0) {
        console.log('Exemple d\'exercice transformé:', {
          id: transformedData[0].id,
          title: transformedData[0].title,
          type: transformedData[0].type, // Vérifier que le type est défini
          tags: transformedData[0].tags
        });
      }

      exercisesCache = transformedData;
      lastFetchTime = Date.now();

      return transformedData;
    } catch (err) {
      console.error('Erreur lors de la récupération des exercices:', err);
      throw err;
    }
  },

  async delete(id: string) {
    console.log('🔵 Début suppression exercice:', id);
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ Erreur de suppression: Utilisateur non authentifié');
        throw new Error('Non authentifié')
      }

      console.log('👤 Suppression pour utilisateur:', user.id);

      const { error } = await supabase
        .from('saved_exercises')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ Erreur Supabase lors de la suppression:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw error
      }

      // Invalider le cache après une suppression
      exercisesCache = null;
      
      console.log('✅ Exercice supprimé avec succès');
    } catch (err) {
      console.error('❌ Erreur inattendue lors de la suppression:', err);
      throw err
    }
  },

  async extractFromLessonPlan(exercise: ExtractedExercise) {
    console.log('🔵 Début extraction depuis le plan de cours:', exercise);
    
    try {
      return await this.save({
        title: exercise.title,
        content: exercise.content,
        subject: exercise.subject,
        class_level: exercise.class_level,
        source_lesson_plan_id: exercise.lesson_plan_id,
        source_type: 'from_lesson_plan'
      })
    } catch (err) {
      console.error('❌ Erreur lors de l\'extraction de l\'exercice:', err);
      throw err
    }
  },

  async getExercisesFromLessonPlan(lessonPlanId: string) {
    console.log('🔵 Début récupération des exercices du plan:', lessonPlanId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ Erreur de récupération: Utilisateur non authentifié');
        throw new Error('Non authentifié')
      }

      console.log('👤 Récupération pour utilisateur:', user.id);

      const { data, error } = await supabase
        .from('saved_exercises')
        .select('*')
        .eq('user_id', user.id)
        .eq('source_lesson_plan_id', lessonPlanId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erreur Supabase lors de la récupération:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw error
      }

      console.log('✅ Exercices récupérés du plan:', data?.length || 0, 'résultats');
      return data
    } catch (err) {
      console.error('❌ Erreur inattendue lors de la récupération:', err);
      throw err
    }
  },

  // Fonction pour invalider manuellement le cache
  invalidateCache() {
    console.log('Invalidation manuelle du cache des exercices');
    exercisesCache = null;
  }
}
