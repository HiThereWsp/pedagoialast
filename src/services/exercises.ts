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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')
      
      const exercise_category: ExerciseCategory = isExerciseCategory(params.exercise_category) 
        ? params.exercise_category 
        : 'standard';
      
      const { data, error } = await supabase
        .from('saved_exercises')
        .insert([{
          ...params,
          user_id: user.id,
          type: 'exercise' as const,
          exercise_category,
          source_type: params.source_lesson_plan_id ? 'from_lesson_plan' : 'direct'
        }])
        .select()

      if (error) throw error

      exercisesCache = null; // Invalider le cache après modification
      return data
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      throw err
    }
  },

  async getAll(): Promise<SavedContent[]> {
    if (isCacheValid()) {
      return exercisesCache!;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('saved_exercises')
        .select('*, saved_lesson_plans!saved_exercises_source_lesson_plan_id_fkey(title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformedData: SavedContent[] = (data || []).map(exercise => ({
        ...exercise,
        type: 'exercise' as const,
        exercise_category: isExerciseCategory(exercise.exercise_category) ? exercise.exercise_category : 'standard',
        source_type: exercise.source_type as 'direct' | 'from_lesson_plan',
        tags: [{
          label: 'Exercice',
          color: '#22C55E',
          backgroundColor: '#22C55E20',
          borderColor: '#22C55E4D'
        }]
      }));

      exercisesCache = transformedData;
      lastFetchTime = Date.now();

      return transformedData
    } catch (err) {
      console.error('Erreur lors de la récupération:', err);
      throw err
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
  }
}
