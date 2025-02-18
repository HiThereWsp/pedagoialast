
import { supabase } from "@/integrations/supabase/client"
import type { SaveExerciseParams } from "@/types/saved-content"

export const exercisesService = {
  async save(params: SaveExerciseParams) {
    console.log('🔵 Début de la sauvegarde exercice:', {
      ...params,
      content: params.content.substring(0, 100) + '...' // Log partiel du contenu
    });

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ Erreur de sauvegarde: Utilisateur non authentifié');
        throw new Error('Non authentifié')
      }
      
      console.log('👤 Utilisateur authentifié:', user.id);
      
      const { data, error } = await supabase
        .from('saved_exercises')
        .insert([{
          ...params,
          user_id: user.id
        }])
        .select()

      if (error) {
        console.error('❌ Erreur Supabase lors de la sauvegarde:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw error
      }

      console.log('✅ Exercice sauvegardé avec succès:', data);
      return data
    } catch (err) {
      console.error('❌ Erreur inattendue lors de la sauvegarde:', err);
      throw err
    }
  },

  async getAll() {
    console.log('🔵 Début récupération des exercices');
    
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
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erreur Supabase lors de la récupération:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw error
      }

      console.log('✅ Exercices récupérés:', data?.length || 0, 'résultats');
      return data
    } catch (err) {
      console.error('❌ Erreur inattendue lors de la récupération:', err);
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

      console.log('✅ Exercice supprimé avec succès');
    } catch (err) {
      console.error('❌ Erreur inattendue lors de la suppression:', err);
      throw err
    }
  }
}
