
import { supabase } from '@/integrations/supabase/client';
import type { LessonPlanData, SavedContent } from '@/types/saved-content';

export const generateLessonPlan = async (data: LessonPlanData) => {
  console.log('🔵 Début génération plan de leçon:', {
    title: data.title,
    subject: data.subject,
    level: data.level
  });

  try {
    const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-lesson-plan', {
      body: data
    });

    if (functionError) {
      console.error('❌ Erreur lors de la génération:', functionError);
      throw functionError;
    }

    console.log('✅ Plan de leçon généré avec succès');
    return functionData;
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la génération:', error);
    throw error;
  }
};

export const getLessonPlans = async (userId?: string): Promise<SavedContent[]> => {
  console.log('🔵 Début récupération des plans de leçon pour userId:', userId);
  
  if (!userId) {
    console.log('⚠️ Aucun userId fourni, retour tableau vide');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('saved_lesson_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur Supabase lors de la récupération:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      throw error;
    }

    console.log('✅ Plans de leçon récupérés:', data?.length || 0, 'résultats');
    
    const transformedData = data.map(plan => {
      console.log('🔄 Transformation plan de leçon:', plan.id);
      return {
        id: plan.id,
        title: plan.title,
        content: plan.content,
        subject: plan.subject,
        class_level: plan.class_level,
        created_at: plan.created_at,
        type: 'lesson-plan' as const,
        tags: [{
          label: 'Séquence',
          color: '#FF9EBC',
          backgroundColor: '#FF9EBC20',
          borderColor: '#FF9EBC4D'
        }]
      };
    });

    console.log('✅ Transformation terminée, données prêtes pour affichage');
    return transformedData;
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la récupération des plans:', error);
    throw error;
  }
};
