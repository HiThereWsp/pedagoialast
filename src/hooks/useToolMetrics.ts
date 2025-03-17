
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import type { ToolMetricRow } from '@/types/database/tables';

export const useToolMetrics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const logToolUsage = async (
    toolType: ToolMetricRow['tool_type'],
    actionType: ToolMetricRow['action_type'],
    contentLength?: number,
    generationTimeMs?: number,
    feedbackScore?: -1 | 1,
    contentId?: string,
    comment?: string
  ) => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Prepare the data object
      const metricData: any = {
        user_id: user.id,
        tool_type: toolType,
        action_type: actionType,
        content_length: contentLength,
        generation_time_ms: generationTimeMs,
        feedback_score: feedbackScore
      };
      
      // Only add contentId and comment if they are provided
      if (contentId) metricData.content_id = contentId;
      if (comment) metricData.comment = comment;

      const { error } = await supabase
        .from('tool_metrics')
        .insert(metricData);

      if (error) throw error;

    } catch (err) {
      console.error('Error logging tool metrics:', err);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de l'enregistrement des métriques",
      });
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  };

  return { logToolUsage, isLoading };
};
