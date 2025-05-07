import { supabase } from '@/integrations/supabase/client';

export interface YouTubeLessonParams {
  videoId: string;
  contentType: 'QCM' | 'Quizz' | 'Question à trous' | 'Exercice simple' | 'Résumé';
  classLevel?: string;
  subject?: string;
  learningObjective?: string;
  // "points de vigilance" removed as requested
  additionalInstructions?: string;
}

export interface SaveYouTubeLessonParams {
  title: string;
  generated_lesson: string;
  video_url: string;
  class_level?: string;
  objective?: string;
}

// Cache for saved YouTube lessons
let youTubeLessonsCache: any[] | null = null;
let lastFetchTimeYouTubeLessons = 0;

const isYouTubeLessonsCacheValid = () => {
  return youTubeLessonsCache !== null && Date.now() - lastFetchTimeYouTubeLessons < 5 * 60 * 1000; // 5 minutes cache
};

export const youtubeLessonsService = {
  extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  },

  async generateLesson(params: YouTubeLessonParams) {
    try {
      const body: any = {
        videoId: params.videoId,
        contentType: params.contentType,
      };
      
      if (params.classLevel) body.classLevel = params.classLevel;
      if (params.subject) body.subject = params.subject;
      if (params.learningObjective) body.learningObjective = params.learningObjective;
      if (params.additionalInstructions) body.additionalInstructions = params.additionalInstructions;

      const { data, error } = await supabase.functions.invoke('youtube-lesson', { body });

      if (error) {
        console.error('Error generating YouTube lesson:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Service error generating YouTube lesson:', error);
      throw error;
    }
  },

  async saveLesson(params: SaveYouTubeLessonParams) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated to save YouTube lesson');
      }

      const { data, error } = await supabase
        .from('youtube_lessons')
        .insert({
          user_id: user.id,
          title: params.title,
          generated_lesson: params.generated_lesson,
          video_url: params.video_url,
          class_level: params.class_level,
          objective: params.objective,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving YouTube lesson:', error);
        throw error;
      }

      youTubeLessonsCache = null; // Invalidate cache
      return data;
    } catch (error) {
      console.error('Service error saving YouTube lesson:', error);
      throw error;
    }
  },

  async getAllSavedLessons() {
    if (isYouTubeLessonsCacheValid()) {
      console.log('Using cached YouTube lessons');
      return youTubeLessonsCache;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated to get saved YouTube lessons');
        return [];
      }

      const { data, error } = await supabase
        .from('youtube_lessons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved YouTube lessons:', error);
        throw error;
      }
      
      youTubeLessonsCache = data;
      lastFetchTimeYouTubeLessons = Date.now();
      return data;
    } catch (error) {
      console.error('Service error fetching saved YouTube lessons:', error);
      return [];
    }
  },

  async deleteLesson(lessonId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated to delete lesson');
      }

      const { error } = await supabase
        .from('youtube_lessons')
        .delete()
        .eq('id', lessonId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting YouTube lesson:', error);
        throw error;
      }

      youTubeLessonsCache = null; // Invalidate cache
      return true;
    } catch (error) {
      console.error('Service error deleting YouTube lesson:', error);
      throw error;
    }
  }
}; 